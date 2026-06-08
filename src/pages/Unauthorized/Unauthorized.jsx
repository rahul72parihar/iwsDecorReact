import { Link } from 'react-router-dom';

export default function Unauthorized() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      padding: '20px',
    }}>
      <div style={{
        textAlign: 'center',
        maxWidth: '500px',
      }}>
        <h1 style={{ fontSize: '48px', margin: '0 0 16px 0', color: '#1a1a1a' }}>
          Access Denied
        </h1>
        <p style={{
          fontSize: '16px',
          color: '#666',
          fontWeight: '700',
          marginTop: '10px',
          marginBottom: '30px',
        }}>
          You do not have permission to access admin features. Only users with admin role can access this area.
        </p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <Link
            to="/"
            style={{
              padding: '10px 20px',
              backgroundColor: '#1a1a1a',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px',
              fontWeight: '600',
              display: 'inline-block',
            }}
          >
            Go Home
          </Link>
          <Link
            to="/account/profile"
            style={{
              padding: '10px 20px',
              backgroundColor: '#f0f0f0',
              color: '#1a1a1a',
              textDecoration: 'none',
              borderRadius: '4px',
              fontWeight: '600',
              display: 'inline-block',
            }}
          >
            My Account
          </Link>
        </div>
      </div>
    </div>
  );
}
