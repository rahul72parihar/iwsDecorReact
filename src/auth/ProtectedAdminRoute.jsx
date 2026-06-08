import { Navigate } from 'react-router-dom';
import useAuth from './useAuth';
import { isUserAdmin } from './roleUtils';

export default function ProtectedAdminRoute({ children }) {
  const { user, loading, userProfile } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        color: '#666',
      }}>
        Loading authentication...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isUserAdmin(userProfile)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
