import { Navigate } from 'react-router-dom';
import useAuth from './useAuth';
import { isUserAdmin } from './roleUtils';

export default function ProtectedUserRoute({ children }) {
  const { user, loading, userProfile } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontSize: '18px',
          color: '#666',
        }}
      >
        Loading authentication...
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Admin users should go to admin dashboard
  if (isUserAdmin(userProfile)) {
    return <Navigate to="/admin" replace />;
  }

  // Regular authenticated users can access the route
  return children;
}