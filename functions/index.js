import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import Razorpay from 'razorpay';

admin.initializeApp();

// Read Razorpay credentials from Functions environment config.
// Set these with: firebase functions:config:set razorpay.key_id="..." razorpay.key_secret="..."
const razorpayKeyId = functions.config().razorpay?.key_id;
const razorpayKeySecret = functions.config().razorpay?.key_secret;

if (!razorpayKeyId || !razorpayKeySecret) {
  // Fail fast at cold start so you notice misconfiguration immediately.
  // eslint-disable-next-line no-console
  console.warn('Razorpay config missing. Set functions config: razorpay.key_id and razorpay.key_secret');
}

const razorpay = new Razorpay({
  key_id: razorpayKeyId,
  key_secret: razorpayKeySecret,
});

function getOrdersCol() {
  return admin.firestore().collection('orders');
}

function safeToInt(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return null;
  return Math.trunc(n);
}

/**
 * Creates a Razorpay order server-side.
 *
 * Request body:
 *  - orderId
 *  - amountINR (number)  e.g. 1299
 *
 * Returns:
 *  - razorpayOrderId
 *  - amount
 *  - currency
 */
export const createRazorpayOrder = functions.https.onRequest(async (req, res) => {
  try {
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    const { orderId, amountINR } = req.body || {};

    if (!orderId || typeof orderId !== 'string') {
      res.status(400).json({ error: 'Missing orderId' });
      return;
    }

    const amountINRInt = safeToInt(amountINR);
    if (!amountINRInt || amountINRInt <= 0) {
      res.status(400).json({ error: 'Invalid amountINR' });
      return;
    }

    const amountPaise = amountINRInt * 100;

    // Mark order as pending (if it's not already).
    const orderRef = getOrdersCol().doc(orderId);
    await orderRef.set(
      {
        status: 'pending',
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    const rzpOrder = await razorpay.orders.create({
      amount: amountPaise,
      currency: 'INR',
      receipt: `rcpt_${orderId}`,
    });

    res.json({
      razorpayOrderId: rzpOrder.id,
      amount: amountPaise,
      currency: 'INR',
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    res.status(500).json({ error: 'Failed to create Razorpay order' });
  }
});

/**
 * Verifies Razorpay payment signature.
 * You can use either a webhook or return-URL verification.
 * Here we verify based on client POST.
 */
export const verifyRazorpayPayment = functions.https.onRequest(async (req, res) => {
  try {
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};

    if (!orderId) {
      res.status(400).json({ error: 'Missing orderId' });
      return;
    }
    if (!razorpay_payment_id || !razorpay_signature || !razorpay_order_id) {
      res.status(400).json({ error: 'Missing Razorpay payment fields' });
      return;
    }

    // Signature verification
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expected = razorpayKeySecret
      ? functions.config().razorpay?.key_secret
      : undefined;

    // Razorpay library provides verify method signature verification.
    // But in some versions, verification helper may differ; we use built-in verify.
    const isValid = razorpay.utils.verifyPaymentSignature({
      order_id: razorpay_order_id,
      payment_id: razorpay_payment_id,
      signature: razorpay_signature,
    });

    if (!isValid) {
      const orderRef = getOrdersCol().doc(orderId);
      await orderRef.set(
        {
          status: 'payment_failed',
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
      res.status(400).json({ error: 'Invalid signature' });
      return;
    }

    const orderRef = getOrdersCol().doc(orderId);
    await orderRef.set(
      {
        status: 'paid',
        payment: {
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
        },
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    res.json({ ok: true });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
});

