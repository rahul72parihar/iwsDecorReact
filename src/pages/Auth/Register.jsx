import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { Link } from 'react-router-dom';

import Header from '../../components/Header/Header.jsx';
import auth from '../../firebase/firebaseAuth';

import './AuthPages.css';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);


  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Enter email and password.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      await createUserWithEmailAndPassword(auth, email.trim(), password);
      window.location.href = '/account/profile';
    } catch (err) {
      setError(err?.message || 'Registration failed.');
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
            <h1>Register</h1>
            <p className="auth-subtitle">Create your account.</p>

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
                  placeholder="At least 6 characters"
                />
              </label>

              <label className="auth-field">
                <span className="auth-label">Confirm Password</span>
                <input
                  className="auth-input"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Repeat password"
                />
              </label>

              {error ? <div className="auth-error">{error}</div> : null}

              <button type="submit" disabled={loading} className="auth-primary-btn">
                {loading ? 'Creating…' : 'Register'}
              </button>

              <div className="auth-footer">
                Already have an account? <Link to="/login">Login</Link>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}

