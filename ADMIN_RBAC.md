# Admin Role-Based Access Control

## Overview

This implementation provides role-based access control (RBAC) for the admin panel. Only users with the `admin` role can access admin routes and perform admin operations.

## How It Works

### Architecture

1. **AuthProvider** - Enhanced to fetch user profile from Firestore
   - Tracks authenticated user via Firebase Authentication
   - Fetches user profile including `role` field from Firestore `users` collection
   - Makes profile available through AuthContext

2. **ProtectedAdminRoute** - Protected route wrapper component
   - Checks if user is authenticated
   - Checks if user has `admin` role
   - Redirects non-authenticated users to `/login`
   - Redirects non-admin users to `/unauthorized`

3. **Role Utils** - Helper functions
   - `isUserAdmin(userProfile)` - Checks if user profile has admin role
   - `hasAdminPermission(userProfile)` - Alias for admin check

4. **useAdminCheck Hook** - Custom hook for component-level checks
   - Returns `isAdmin`, `isAuthenticated`, `loading` flags
   - Use in components to show/hide admin features

## Setting Up Admin Users

### Method 1: Firebase Console (Manual)

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Navigate to Firestore Database
3. Find the `users` collection
4. Select or create a user document (document ID should match Firebase auth UID)
5. Add a field: `role: "admin"`

**Example user document structure:**
```json
{
  "email": "admin@example.com",
  "name": "Admin User",
  "role": "admin",
  "createdAt": "2024-06-08T...",
  "updatedAt": "2024-06-08T..."
}
```

### Method 2: Firestore Rules (Backend Security)

The client-side route protection is for UX. For real security, configure Firestore rules to restrict admin operations:

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    match /products/{document=**} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    match /categories/{document=**} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    match /orders/{document=**} {
      allow read: if isAdmin();
      allow write: if isAdmin();
    }
    
    match /users/{userId} {
      allow read: if request.auth.uid == userId || isAdmin();
      allow write: if request.auth.uid == userId;
    }
    
    function isAdmin() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid))
        .data.role == 'admin';
    }
  }
}
```

## Usage

### Protecting Routes

All admin routes are automatically protected via `ProtectedAdminRoute` wrapper:

```jsx
<Route path="/admin" element={<ProtectedAdminRoute><AdminDashboard /></ProtectedAdminRoute>} />
<Route path="/admin/products" element={<ProtectedAdminRoute><AdminProducts /></ProtectedAdminRoute>} />
```

### In Components

Use the `useAdminCheck` hook:

```jsx
import useAdminCheck from '../auth/useAdminCheck';

export default function MyComponent() {
  const { isAdmin, isAuthenticated, loading } = useAdminCheck();

  if (loading) return <div>Loading...</div>;
  
  if (!isAuthenticated) return <div>Please login</div>;
  
  if (!isAdmin) return <div>Admin access required</div>;

  return <div>Admin-only content</div>;
}
```

Or use the AuthContext directly:

```jsx
import useAuth from '../auth/useAuth';
import { isUserAdmin } from '../auth/roleUtils';

export default function MyComponent() {
  const { user, userProfile, loading } = useAuth();

  if (!loading && user && isUserAdmin(userProfile)) {
    return <div>Admin-only content</div>;
  }

  return null;
}
```

## Testing

### Test Admin Access

1. Create a test user with `role: "admin"` in Firestore
2. Log in with that user
3. Navigate to `/admin` - should see admin dashboard
4. Try non-admin user - should be redirected to `/unauthorized`
5. Try unauthenticated access - should redirect to `/login`

### Test API Security

Ensure backend Firestore rules are configured (see Method 2 above) so that:
- Non-authenticated users cannot write to protected collections
- Non-admin users cannot create/edit/delete admin resources
- Only admins can perform admin operations

## Files Modified/Created

### New Files
- `src/auth/roleUtils.js` - Role checking utilities
- `src/auth/ProtectedAdminRoute.jsx` - Protected route wrapper
- `src/auth/useAdminCheck.js` - Admin check hook
- `src/pages/Unauthorized/Unauthorized.jsx` - Unauthorized error page

### Modified Files
- `src/auth/AuthProvider.jsx` - Added user profile fetching
- `src/App.jsx` - Wrapped admin routes with ProtectedAdminRoute

## Security Considerations

1. **Client-side protection** is for UX - always validate on backend
2. **Firestore Security Rules** must restrict admin operations
3. **Role stored in Firestore** - secure via Firestore rules who can edit
4. **No hardcoded roles** - always read from database
5. **Logout clears role** - AuthContext becomes null when user logs out

## Troubleshooting

### User can't access admin panel after login
- Check Firestore user document has `role: "admin"` field
- Check Firebase auth UID matches Firestore document ID
- Verify AuthProvider successfully fetched user profile

### Still seeing "Please login" after login
- Clear browser cache/cookies
- Refresh the page
- Check browser console for errors

### Admin role not working for API calls
- Configure Firestore Security Rules (see Method 2)
- Test with `curl` that requests are blocked for non-admins
- Verify backend is checking `request.auth` in rules
