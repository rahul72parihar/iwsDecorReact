import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Link } from 'react-router-dom';

import Header from '../../components/Header/Header.jsx';
import auth from '../../firebase/firebaseAuth';

import './AuthPages.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);


  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Enter email and password.');
      return;
    }

    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email.trim(), password);
      // App currently doesn't have post-login routing logic.
      // Users can navigate manually to /account/profile.
      window.location.href = '/account/profile';
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
            <h1>Login</h1>
            <p className="auth-subtitle">Sign in to your account.</p>

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

              {error ? <div className="auth-error">{error}</div> : null}

              <button type="submit" disabled={loading} className="auth-primary-btn">
                {loading ? 'Signing in…' : 'Login'}
              </button>

              <div className="auth-footer">
                New here? <Link to="/register">Create an account</Link>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}

