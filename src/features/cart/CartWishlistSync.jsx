import { useEffect, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import useAuth from '../../auth/useAuth';

import { setUserCart, getUserCart } from '../../firebase/cartService';
import { setUserWishlist, getUserWishlist } from '../../firebase/wishlistService';

import {
  addToCart,
  clearCart,
  increaseQuantity,
} from './cartSlice';

import { toggleWishlist, clearWishlist } from '../wishlist/wishlistSlice';

function arraysEqualById(a, b) {
  const aa = (a || []).map((x) => x.id).sort();
  const bb = (b || []).map((x) => x.id).sort();
  return aa.length === bb.length && aa.every((v, i) => v === bb[i]);
}

export default function CartWishlistSync() {
  const { user, loading } = useAuth();
  const uid = user?.uid;

  const dispatch = useDispatch();

  const cart = useSelector((s) => s.cart);
  const wishlist = useSelector((s) => s.wishlist);

  const isHydratingRef = useRef(false);
  const debounceTimerRef = useRef(null);
  const lastPushedRef = useRef({ cart: null, wishlist: null });

  const hasUser = !!uid;

  // Load Firestore -> Redux on login
  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      if (!hasUser) {
        // When logging out we leave current Redux/localStorage as-is.
        return;
      }

      isHydratingRef.current = true;

      try {
        const [remoteCart, remoteWishlist] = await Promise.all([
          getUserCart(uid),
          getUserWishlist(uid),
        ]);

        if (cancelled) return;

        // Cart
        dispatch(clearCart());
        if (remoteCart?.items?.length) {
          // re-add using addToCart (quantities will become 1 each time)
          // so we apply correct quantities by increasing/decreasing after.
          for (const it of remoteCart.items) {
            dispatch(addToCart({ id: it.id, name: it.name, image: it.image, category: it.category, price: it.price }));
            // adjust quantity to match
            const currentQty = 1;
            const targetQty = Number(it.quantity) || 1;
            const diff = targetQty - currentQty;
            for (let i = 0; i < diff; i++) {
              dispatch(increaseQuantity(it.id));
            }
          }
        }

        // Wishlist
        dispatch(clearWishlist());
        if (remoteWishlist?.items?.length) {
          // toggleWishlist inserts if missing.
          for (const p of remoteWishlist.items) {
            dispatch(toggleWishlist(p));
          }
        }
      } finally {
        isHydratingRef.current = false;
      }
    }

    if (!loading) {
      hydrate();
    }

    return () => {
      cancelled = true;
    };
  }, [uid, loading, hasUser, dispatch]);

  // Redux -> Firestore with debounce
  useEffect(() => {
    if (loading) return;
    if (!hasUser) return;
    if (isHydratingRef.current) return;

    const currentCartPayload = {
      items: cart?.items ?? [],
      totalQuantity: cart?.totalQuantity ?? 0,
      totalPrice: cart?.totalPrice ?? 0,
    };

    const currentWishlistPayload = {
      items: wishlist?.items ?? [],
    };

    const last = lastPushedRef.current;

    // lightweight change detection
    const cartChanged =
      !last?.cart ||
      last.cart.totalPrice !== currentCartPayload.totalPrice ||
      last.cart.totalQuantity !== currentCartPayload.totalQuantity ||
      !arraysEqualById(last.cart.items, currentCartPayload.items);

    const wishlistChanged =
      !last?.wishlist ||
      !arraysEqualById(last.wishlist.items, currentWishlistPayload.items);

    if (!cartChanged && !wishlistChanged) return;

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    debounceTimerRef.current = setTimeout(async () => {
      try {
        await Promise.all([
          setUserCart(uid, currentCartPayload),
          setUserWishlist(uid, currentWishlistPayload),
        ]);

        lastPushedRef.current = {
          cart: currentCartPayload,
          wishlist: currentWishlistPayload,
        };
      } catch {
        // ignore write failures (offline / rules)
      }
    }, 500);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [cart, wishlist, hasUser, uid, loading]);

  const ready = useMemo(() => true, []);
  return ready ? null : null;
}

