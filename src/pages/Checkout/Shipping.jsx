import { useEffect, useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { clearCart } from '../../features/cart/cartSlice';
import { setCheckoutSession, getCheckoutSession } from './CheckoutUtils';

import useAuth from '../../auth/useAuth';
import { addAddress, getDefaultAddressId, listAddresses, setDefaultAddressId } from '../../firebase/addressService';

const REQUIRED_FIELDS = ['fullName', 'phone', 'line1', 'city', 'state', 'pincode'];

function validateAddress(addr) {
  const missing = REQUIRED_FIELDS.filter((k) => !String(addr?.[k] ?? '').trim());
  return { ok: missing.length === 0, missing };
}

export default function Shipping() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cart = useSelector((s) => s.cart);

  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [loadError, setLoadError] = useState('');

  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [showNewAddress, setShowNewAddress] = useState(false);

  const [newAddress, setNewAddress] = useState({
    fullName: '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    landmark: '',
  });

  const [formError, setFormError] = useState('');
  const [savingAddress, setSavingAddress] = useState(false);

  const canProceed = useMemo(() => !!selectedAddressId && cart.items.length > 0, [selectedAddressId, cart.items.length]);

  useEffect(() => {
    if (loading) return;
    if (!user) return;

    let active = true;
    (async () => {
      setLoadingAddresses(true);
      setLoadError('');
      try {
        const list = await listAddresses(user.uid);
        if (!active) return;
        setAddresses(list);

        const session = getCheckoutSession();
        if (session?.selectedAddressId) {
          setSelectedAddressId(session.selectedAddressId);
          return;
        }

        const defaultId = await getDefaultAddressId(user.uid);
        if (!active) return;

        if (defaultId && list.some((a) => a.id === defaultId)) {
          setSelectedAddressId(defaultId);
        } else if (list.length > 0) {
          setSelectedAddressId(list[0].id);
        }
      } catch (e) {
        console.error(e);
        if (!active) return;
        setLoadError('Failed to load saved addresses.');
      } finally {
        if (active) setLoadingAddresses(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [loading, user]);

  useEffect(() => {
    setCheckoutSession({ selectedAddressId });
  }, [selectedAddressId]);

  const selectedAddress = useMemo(() => {
    return addresses.find((a) => a.id === selectedAddressId) ?? null;
  }, [addresses, selectedAddressId]);

  async function handleSaveNewAddress(e) {
    e.preventDefault();
    setFormError('');

    const v = validateAddress(newAddress);
    if (!v.ok) {
      setFormError(`Please fill: ${v.missing.join(', ')}`);
      return;
    }

    if (!user) return;

    setSavingAddress(true);
    try {
      const id = await addAddress(user.uid, newAddress);
      await setDefaultAddressId(user.uid, id);

      const updated = await listAddresses(user.uid);
      setAddresses(updated);
      setSelectedAddressId(id);
      setShowNewAddress(false);
      setNewAddress({
        fullName: '',
        phone: '',
        line1: '',
        line2: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India',
        landmark: '',
      });
    } catch (err) {
      console.error(err);
      setFormError('Could not save address. Please try again.');
    } finally {
      setSavingAddress(false);
    }
  }

  function handleContinue() {
    if (!canProceed) return;
    if (!selectedAddress) return;

    setCheckoutSession({
      selectedAddressId,
      selectedAddress: selectedAddress,
    });

    navigate('/checkout/payment');
  }

  return (
    <div style={{ padding: 24, maxWidth: 980, margin: '0 auto' }}>
      <h1 style={{ marginTop: 0 }}>Shipping</h1>

      {cart.items.length === 0 ? (
        <div style={{ marginTop: 12, color: 'rgba(29,24,21,0.65)', fontWeight: 800 }}>
          Your cart is empty.
        </div>
      ) : null}

      <div
        style={{
          marginTop: 14,
          padding: 14,
          borderRadius: 18,
          background: 'rgba(255,255,255,0.9)',
          border: '1px solid rgba(0,0,0,0.04)',
          boxShadow: '0 14px 38px rgba(0,0,0,0.06)',
        }}
      >
        <h3 style={{ margin: 0 }}>Choose a saved address</h3>

        {loadingAddresses ? <div style={{ marginTop: 10 }}>Loading addresses...</div> : null}
        {loadError ? <div style={{ marginTop: 10, color: 'crimson', fontWeight: 800 }}>{loadError}</div> : null}

        {!loadingAddresses && addresses.length === 0 ? (
          <div style={{ marginTop: 10, color: 'rgba(29,24,21,0.65)', fontWeight: 800 }}>
            No saved addresses yet.
          </div>
        ) : null}

        <div style={{ marginTop: 12, display: 'grid', gap: 10 }}>
          {addresses.map((a) => (
            <label
              key={a.id}
              style={{
                display: 'flex',
                gap: 10,
                alignItems: 'flex-start',
                padding: 12,
                borderRadius: 14,
                border: selectedAddressId === a.id ? '2px solid rgba(0,0,0,0.75)' : '1px solid rgba(0,0,0,0.08)',
                cursor: 'pointer',
                background: selectedAddressId === a.id ? 'rgba(0,0,0,0.02)' : 'transparent',
              }}
            >
              <input
                type="radio"
                name="selectedAddress"
                checked={selectedAddressId === a.id}
                onChange={() => setSelectedAddressId(a.id)}
                style={{ marginTop: 4 }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 900 }}>{a.fullName}</div>
                <div style={{ color: 'rgba(29,24,21,0.8)', fontWeight: 700, marginTop: 2 }}>{a.phone}</div>
                <div style={{ marginTop: 4, color: 'rgba(29,24,21,0.75)', fontWeight: 700, fontSize: 13, lineHeight: 1.4 }}>
                  {a.line1}
                  {a.line2 ? `, ${a.line2}` : ''}
                  <br />
                  {a.city}, {a.state} - {a.pincode}
                  <br />
                  {a.country}
                  {a.landmark ? ` • Landmark: ${a.landmark}` : ''}
                </div>
              </div>
            </label>
          ))}
        </div>

        <div style={{ marginTop: 14, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setShowNewAddress((v) => !v)}
            style={{
              border: '1px solid rgba(0,0,0,0.14)',
              background: 'white',
              borderRadius: 12,
              padding: '10px 14px',
              cursor: 'pointer',
              fontWeight: 800,
            }}
          >
            {showNewAddress ? 'Cancel' : 'Add new address'}
          </button>

          {canProceed ? (
            <button
              type="button"
              onClick={handleContinue}
              style={{
                background: '#1d1815',
                color: 'white',
                border: '1px solid rgba(0,0,0,0.14)',
                borderRadius: 12,
                padding: '10px 16px',
                cursor: 'pointer',
                fontWeight: 900,
              }}
            >
              Continue to payment
            </button>
          ) : (
            <button
              type="button"
              disabled
              style={{
                opacity: 0.5,
                background: '#1d1815',
                color: 'white',
                border: '1px solid rgba(0,0,0,0.14)',
                borderRadius: 12,
                padding: '10px 16px',
                cursor: 'not-allowed',
                fontWeight: 900,
              }}
            >
              Select an address to continue
            </button>
          )}
        </div>

        {showNewAddress ? (
          <form onSubmit={handleSaveNewAddress} style={{ marginTop: 16 }}>
            <h3 style={{ marginTop: 0 }}>Add a new address</h3>
            {formError ? <div style={{ color: 'crimson', fontWeight: 800, marginBottom: 10 }}>{formError}</div> : null}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <label>
                Full name*
                <input
                  required
                  value={newAddress.fullName}
                  onChange={(e) => setNewAddress((p) => ({ ...p, fullName: e.target.value }))}
                  style={{ width: '100%', padding: 10, marginTop: 6, borderRadius: 12, border: '1px solid rgba(0,0,0,0.15)' }}
                />
              </label>
              <label>
                Phone*
                <input
                  required
                  value={newAddress.phone}
                  onChange={(e) => setNewAddress((p) => ({ ...p, phone: e.target.value }))}
                  style={{ width: '100%', padding: 10, marginTop: 6, borderRadius: 12, border: '1px solid rgba(0,0,0,0.15)' }}
                />
              </label>
              <label style={{ gridColumn: '1 / -1' }}>
                Address line 1*
                <input
                  required
                  value={newAddress.line1}
                  onChange={(e) => setNewAddress((p) => ({ ...p, line1: e.target.value }))}
                  style={{ width: '100%', padding: 10, marginTop: 6, borderRadius: 12, border: '1px solid rgba(0,0,0,0.15)' }}
                />
              </label>
              <label style={{ gridColumn: '1 / -1' }}>
                Address line 2
                <input
                  value={newAddress.line2}
                  onChange={(e) => setNewAddress((p) => ({ ...p, line2: e.target.value }))}
                  style={{ width: '100%', padding: 10, marginTop: 6, borderRadius: 12, border: '1px solid rgba(0,0,0,0.15)' }}
                />
              </label>
              <label>
                City*
                <input
                  required
                  value={newAddress.city}
                  onChange={(e) => setNewAddress((p) => ({ ...p, city: e.target.value }))}
                  style={{ width: '100%', padding: 10, marginTop: 6, borderRadius: 12, border: '1px solid rgba(0,0,0,0.15)' }}
                />
              </label>
              <label>
                State*
                <input
                  required
                  value={newAddress.state}
                  onChange={(e) => setNewAddress((p) => ({ ...p, state: e.target.value }))}
                  style={{ width: '100%', padding: 10, marginTop: 6, borderRadius: 12, border: '1px solid rgba(0,0,0,0.15)' }}
                />
              </label>
              <label>
                Pincode*
                <input
                  required
                  value={newAddress.pincode}
                  onChange={(e) => setNewAddress((p) => ({ ...p, pincode: e.target.value }))}
                  style={{ width: '100%', padding: 10, marginTop: 6, borderRadius: 12, border: '1px solid rgba(0,0,0,0.15)' }}
                />
              </label>
              <label>
                Landmark
                <input
                  value={newAddress.landmark}
                  onChange={(e) => setNewAddress((p) => ({ ...p, landmark: e.target.value }))}
                  style={{ width: '100%', padding: 10, marginTop: 6, borderRadius: 12, border: '1px solid rgba(0,0,0,0.15)' }}
                />
              </label>
            </div>

            <div style={{ marginTop: 12, display: 'flex', gap: 12, alignItems: 'center' }}>
              <button
                type="submit"
                disabled={savingAddress}
                style={{
                  background: '#1d1815',
                  color: 'white',
                  border: '1px solid rgba(0,0,0,0.14)',
                  borderRadius: 12,
                  padding: '10px 16px',
                  cursor: savingAddress ? 'not-allowed' : 'pointer',
                  fontWeight: 900,
                  opacity: savingAddress ? 0.7 : 1,
                }}
              >
                {savingAddress ? 'Saving...' : 'Save address & continue'}
              </button>
            </div>
          </form>
        ) : null}
      </div>
    </div>
  );
}

