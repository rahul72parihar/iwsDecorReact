import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';

import auth from '../../firebase/firebaseAuth';

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
    <div style={{ padding: 24, maxWidth: 520, margin: '0 auto' }}>
      <h1 style={{ marginBottom: 8 }}>Register</h1>
      <p style={{ marginTop: 0, marginBottom: 18, color: 'rgba(29,24,21,0.7)', fontWeight: 700 }}>
        Create your account.
      </p>

      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontWeight: 700, color: '#1d1815' }}>Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
            style={{ padding: '12px 14px', borderRadius: 14, border: '1px solid rgba(0,0,0,0.12)' }}
          />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontWeight: 700, color: '#1d1815' }}>Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="At least 6 characters"
            style={{ padding: '12px 14px', borderRadius: 14, border: '1px solid rgba(0,0,0,0.12)' }}
          />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontWeight: 700, color: '#1d1815' }}>Confirm Password</span>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            placeholder="Repeat password"
            style={{ padding: '12px 14px', borderRadius: 14, border: '1px solid rgba(0,0,0,0.12)' }}
          />
        </label>

        {error ? (
          <div style={{ color: '#b00020', fontWeight: 800 }}>{error}</div>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          style={{
            marginTop: 8,
            padding: '12px 16px',
            borderRadius: 14,
            border: '1px solid rgba(0,0,0,0.12)',
            background: loading ? 'rgba(201,168,76,0.4)' : '#c9a84c',
            color: '#1d1815',
            fontWeight: 800,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Creating…' : 'Register'}
        </button>

        <div style={{ marginTop: 6, fontWeight: 700, color: 'rgba(29,24,21,0.7)' }}>
          Already have an account?{' '}
          <a href="/login" style={{ color: '#c9a84c' }}>
            Login
          </a>
        </div>
      </form>
    </div>
  );
}

