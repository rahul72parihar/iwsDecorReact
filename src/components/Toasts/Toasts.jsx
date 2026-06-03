import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { removeToast } from '../../store/toastSlice';

import './Toasts.css';

export default function Toasts() {
  const dispatch = useDispatch();
  const toasts = useSelector((s) => s.toast?.toasts ?? []);

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

          {t.link ? (
            <Link
              to={t.link}
              className="toast-body toast-link"
              onClick={() => dispatch(removeToast(t.id))}
            >
              {t.title ? (
                <div className="toast-title">{t.title}</div>
              ) : null}

              {t.message ? (
                <div className="toast-message">{t.message}</div>
              ) : null}
            </Link>
          ) : (
            <div className="toast-body">
              {t.title ? (
                <div className="toast-title">{t.title}</div>
              ) : null}

              {t.message ? (
                <div className="toast-message">{t.message}</div>
              ) : null}
            </div>
          )}

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