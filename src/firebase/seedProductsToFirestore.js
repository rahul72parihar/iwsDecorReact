/* eslint-disable no-console */

// Usage (from project root):
//   node src/firebase/seedProductsToFirestore.js
//
// This will upsert documents into Firestore collection: `products`
// using the local dataset in `src/data/products.js`.
//
// NOTE: The storefront currently uses `src/data/products.js` directly,
// but Admin Products uses Firestore. This script makes Firestore
// match the seed data.

import { products as seedProducts } from '../data/products.js';
import { createOrUpdateProduct } from './productService.js';

function requiredEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var ${name}. Create it and re-run the seeding script.`);
  return v;
}

// Seed script runs with Node, so `import.meta.env` is not available.
// Provide Firebase config via env vars instead.
process.env.VITE_FIREBASE_API_KEY ??= requiredEnv('VITE_FIREBASE_API_KEY');
process.env.VITE_FIREBASE_AUTH_DOMAIN ??= requiredEnv('VITE_FIREBASE_AUTH_DOMAIN');
process.env.VITE_FIREBASE_PROJECT_ID ??= requiredEnv('VITE_FIREBASE_PROJECT_ID');
process.env.VITE_FIREBASE_STORAGE_BUCKET ??= requiredEnv('VITE_FIREBASE_STORAGE_BUCKET');
process.env.VITE_FIREBASE_MESSAGING_SENDER_ID ??= requiredEnv('VITE_FIREBASE_MESSAGING_SENDER_ID');
process.env.VITE_FIREBASE_APP_ID ??= requiredEnv('VITE_FIREBASE_APP_ID');


function normalizeSeedProduct(p) {
  // AdminProducts expects these fields.
  return {
    id: String(p.id),
    name: p.name ?? '',
    category: p.category ?? '',
    subcategory: p.subcategory ?? '',
    brand: p.brand ?? 'IWS Signature',
    price: Number.isFinite(p.price) ? p.price : p.price ? Number(p.price) : null,
    oldPrice:
      Number.isFinite(p.oldPrice) ? p.oldPrice : p.oldPrice ? Number(p.oldPrice) : null,

    // AdminProducts currently only persists `inStock` + `tags` + `description` + images.
    // Our seed doesn't include description/images, so we provide empty description.
    inStock: !!p.inStock,
    tags: {
      featured: !!p.tags?.featured,
      newest: !!p.tags?.newest,
      bestSelling: !!p.tags?.bestSelling,
    },
    description:
      p.description ??
      `${p.name ?? 'This product'} — handcrafted luxury decor and statement lighting for refined interiors.`,

    // Product main image url from seed
    image: p.image ?? '',

    // Additional images not present in seed; keep empty.
    additionalImageUrls: p.additionalImageUrls ?? [],
  };
}

async function main() {
  console.log(`[seedProductsToFirestore] Seeding ${seedProducts.length} products...`);

  let ok = 0;
  let failed = 0;

  for (const p of seedProducts) {
    const productId = String(p.id);
    const data = normalizeSeedProduct(p);

    try {
      await createOrUpdateProduct(productId, data);
      ok++;
      process.stdout.write(`\r[seedProductsToFirestore] ✅ ${ok}/${seedProducts.length}`);
    } catch (e) {
      failed++;
      console.error(`\n[seedProductsToFirestore] ❌ Failed for id=${productId}:`, e?.message || e);
    }
  }

  console.log(`\nDone. ✅ ${ok}, ❌ ${failed}`);
}

main().catch((e) => {
  console.error('[seedProductsToFirestore] Fatal:', e?.message || e);
  process.exit(1);
});

