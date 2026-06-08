import useAuth from './useAuth';
import { isUserAdmin } from './roleUtils';

export default function useAdminCheck() {
  const { user, userProfile, loading } = useAuth();

  const isAdmin = !loading && user && isUserAdmin(userProfile);
  const isAuthenticated = !loading && !!user;

  return {
    isAdmin,
    isAuthenticated,
    loading,
    user,
    userProfile,
  };
}
