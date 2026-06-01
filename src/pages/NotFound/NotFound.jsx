import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div style={{ padding: 24 }}>
      <h1>404 - Not Found</h1>
      <p>The page you requested does not exist.</p>
      <Link to="/" style={{ textDecoration: 'none' }}>
        Go to Home
      </Link>
    </div>
  );
}

