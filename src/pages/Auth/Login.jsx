import { useState } from 'react';
import { Link } from 'react-router-dom';

import Header from '../../components/Header/Header.jsx';
import {
  signInWithEmailPassword,
  signInWithGooglePopup,
} from '../../firebase/authService';

import './AuthPages.css';
import Footer from '../../components/Footer/Footer.jsx';

const PRESETS = {
  user: { email: 'test@user.com',   password: 'Test123',    label: 'User'  },
  admin: { email: 'admin@admin.com', password: 'Admin@iws',  label: 'Admin' },
};

export default function Login() {
  const [mode, setMode]         = useState('user');
  const [email, setEmail]       = useState(PRESETS.user.email);
  const [password, setPassword] = useState(PRESETS.user.password);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const switchMode = (next) => {
    setMode(next);
    setEmail(PRESETS[next].email);
    setPassword(PRESETS[next].password);
    setError('');
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Enter email and password.');
      return;
    }

    try {
      setLoading(true);
      await signInWithEmailPassword(email.trim(), password);
      window.location.href = mode === 'admin' ? '/admin' : '/';
    } catch (err) {
      setError(err?.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Header />

      <div className="auth-page">
        <div className="auth-layout auth-layout--single">
          <section className="auth-card">

            {/* ── Mode toggle ── */}
            <div className="auth-mode-toggle">
              {Object.entries(PRESETS).map(([key, { label }]) => (
                <button
                  key={key}
                  type="button"
                  className={`auth-mode-btn${mode === key ? ' active' : ''}`}
                  onClick={() => switchMode(key)}
                >
                  {label}
                </button>
              ))}
            </div>

            <h1>{mode === 'admin' ? 'Admin Login' : 'Login'}</h1>
            <p className="auth-subtitle">
              {mode === 'admin'
                ? 'Sign in to the admin dashboard.'
                : 'Sign in to your account.'}
            </p>

            <form onSubmit={onSubmit} className="auth-form">
              <label className="auth-field">
                <span className="auth-label">Email</span>
                <input
                  className="auth-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                />
              </label>

              <label className="auth-field">
                <span className="auth-label">Password</span>
                <input
                  className="auth-input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                />
              </label>

              {error && <div className="auth-error">{error}</div>}

              <button type="submit" disabled={loading} className="auth-primary-btn">
                {loading ? 'Signing in…' : `Login as ${PRESETS[mode].label}`}
              </button>

              {/* Google sign-in — only for regular users */}
              {mode === 'user' && (
                <>
                  <div className="auth-divider">or</div>

                  <button
                    type="button"
                    disabled={loading}
                    className="auth-secondary-btn"
                    onClick={async () => {
                      setError('');
                      setLoading(true);
                      try {
                        await signInWithGooglePopup();
                        window.location.href = '/account/profile';
                      } catch (err) {
                        setError(err?.message || 'Google sign-in failed.');
                      } finally {
                        setLoading(false);
                      }
                    }}
                  >
                    {loading ? 'Signing in…' : 'Continue with Google'}
                  </button>
                </>
              )}

              {mode === 'user' && (
                <div className="auth-footer">
                  New here? <Link to="/register">Create an account</Link>
                </div>
              )}
            </form>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
}