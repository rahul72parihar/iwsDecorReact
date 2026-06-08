export function isUserAdmin(userProfile) {
  if (!userProfile) return false;
  return userProfile.role === 'admin';
}

export function hasAdminPermission(userProfile) {
  return isUserAdmin(userProfile);
}
