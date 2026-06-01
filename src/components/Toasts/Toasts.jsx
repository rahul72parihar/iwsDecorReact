import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { removeToast } from '../../store/toastSlice';

import './Toasts.css';

export default function Toasts() {
  const dispatch = useDispatch();
  const toasts = useSelector((s) => s.toast?.toasts ?? []);

  // Safety: if tabs freeze timers, still allow manual cleanup by TTL handled by setTimeout in pushAutoToast.
  useEffect(() => {
    return () => {
      // no-op
    };
  }, []);

  if (!toasts.length) return null;

  return (
    <div className="toasts" aria-live="polite" aria-relevant="additions">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`toast toast-${t.type}`}
          role="status"
        >
          <div className="toast-dot" aria-hidden="true" />
          <div className="toast-body">
            {t.title ? <div className="toast-title">{t.title}</div> : null}
            {t.message ? <div className="toast-message">{t.message}</div> : null}
          </div>
          <button
            type="button"
            className="toast-close"
            onClick={() => dispatch(removeToast(t.id))}
            aria-label="Dismiss notification"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}

