import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import useAuth from '../../auth/useAuth';

import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';

export default function Settings() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const canRender = useMemo(() => !!user && !loading, [user, loading]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!canRender) return;
    setError('');
  }, [canRender]);

  const onSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      // Placeholder page for now.
      // Existing project persists profile/address data in Profile.jsx.
      await new Promise((r) => setTimeout(r, 250));
    } catch (e) {
      setError(e?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ minHeight: 400 }}>
      <Header />

      <div style={{ padding: 24, maxWidth: 980, margin: '0 auto' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 10 }}>
          <h1 style={{ margin: 0 }}>Settings</h1>
          <button
            type="button"
            onClick={() => navigate('/account/profile')}
            style={{
              marginLeft: 'auto',
              border: '1px solid rgba(0,0,0,0.14)',
              background: 'white',
              borderRadius: 12,
              padding: '10px 14px',
              cursor: 'pointer',
              fontWeight: 900,
            }}
          >
            Back
          </button>
        </div>

        {!canRender ? (
          <div style={{ marginTop: 14 }}>Loading…</div>
        ) : (
          <>
            <div
              style={{
                color: 'rgba(29,24,21,0.65)',
                fontWeight: 800,
                marginTop: 8,
                fontSize: 13,
              }}
            >
              Configure account preferences.
            </div>

            <form onSubmit={onSave} style={{ marginTop: 18 }}>
              <div
                style={{
                  padding: 16,
                  borderRadius: 18,
                  background: 'rgba(255,255,255,0.9)',
                  border: '1px solid rgba(0,0,0,0.06)',
                }}
              >
                <div style={{ fontWeight: 950, marginBottom: 8 }}>Coming soon</div>
                <div style={{ color: 'rgba(29,24,21,0.7)', fontWeight: 800, fontSize: 13 }}>
                  This page is reserved for future user settings.
                </div>

                {error ? (
                  <div style={{ marginTop: 12, color: 'crimson', fontWeight: 900 }}>{error}</div>
                ) : null}

                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    marginTop: 16,
                    background: '#111',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 12,
                    padding: '12px 16px',
                    cursor: saving ? 'not-allowed' : 'pointer',
                    fontWeight: 950,
                    opacity: saving ? 0.7 : 1,
                  }}
                >
                  {saving ? 'Saving…' : 'Save Settings'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}

