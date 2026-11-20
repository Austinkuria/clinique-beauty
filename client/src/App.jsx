import React, { useContext, Suspense, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { ThemeProvider as MUIThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeContext } from './context/ThemeContext';
import { Box, CircularProgress, Typography } from '@mui/material';
import { CartProvider } from './context/CartContext.jsx';
import { WishlistProvider } from './context/WishlistContext.jsx';
import { useInitializeApi } from './api/apiClient';
import { useUser, useClerk } from '@clerk/clerk-react';
import { syncUserToSupabase } from './services/userSyncService';
import { toast } from 'react-hot-toast';
import { handleApiError } from './components/ErrorHandler';
import { AdminProvider } from './context/AdminContext';
import { CategoryProvider } from './context/CategoryContext';

function App() {
  const { muiTheme } = useContext(ThemeContext);
  const { isLoaded, isSignedIn, user } = useUser();
  const { session, signOut } = useClerk();

  useInitializeApi();

  // Real-time session invalidation / token blacklist listener
  useEffect(() => {
    let socket;
    try {
      const socketBase = import.meta.env.VITE_API_URL 
        ? new URL(import.meta.env.VITE_API_URL).origin 
        : 'http://localhost:5001';

      import('socket.io-client').then(({ io }) => {
        socket = io(socketBase, { withCredentials: true });
        socket.on('auth:role_revoked', (data) => {
          if (!user) return;
          const userEmail = (user.primaryEmailAddress?.emailAddress || '').toLowerCase();
          const targetEmail = (data?.email || '').toLowerCase();
          const targetId = data?.userId;

          if ((targetId && targetId === user.id) || (targetEmail && targetEmail === userEmail)) {
            toast.error(
              `Your account role was updated to ${data.newRole || 'new role'}. Signing out to refresh permissions...`,
              { duration: 5000 }
            );
            localStorage.removeItem('userIsAdmin');
            setTimeout(async () => {
              try {
                if (signOut) await signOut();
                window.location.href = '/auth/login';
              } catch {
                window.location.reload();
              }
            }, 1200);
          }
        });
      }).catch(() => {});
    } catch {}

    return () => {
      if (socket) socket.disconnect();
    };
  }, [user, signOut]);

  // Sync user to Supabase when they sign in
  useEffect(() => {
    const handleUserSync = async () => {
      if (isLoaded && isSignedIn && user) {
        try {
          console.log("App: Attempting to sync user to Supabase...");
          const result = await syncUserToSupabase(user, session.getToken);
          
          if (result && result.success) {
            console.log("App: User sync complete");
            const userRole = (result.user?.role || localStorage.getItem('userRole') || '').toLowerCase();
            const currentPath = window.location.pathname;

            // Automatically navigate admins and sellers to their dashboards when signing in
            if (currentPath.startsWith('/auth/login') || currentPath.startsWith('/auth/register') || currentPath === '/auth/sso-callback' || currentPath === '/auth/login-redirect') {
              if (userRole === 'admin') {
                window.location.href = '/admin';
              } else if (userRole === 'seller') {
                window.location.href = '/seller';
              } else {
                window.location.href = '/';
              }
            }
          } else {
            console.log("App: User sync completed with warnings - app will continue");
          }
        } catch (error) {
          console.error('App: Error syncing user to database:', error);
          
          // Only show toast in production, not during development setup
          if (import.meta.env.PROD) {
            // Silent error - don't show to user since this might be expected during development
            handleApiError(error, "User profile sync failed silently");
          }
        }
      }
    };

    handleUserSync();
  }, [isLoaded, isSignedIn, user, session]);

  return (
    <MUIThemeProvider theme={muiTheme}>
      <CssBaseline />
      <CategoryProvider>
        <CartProvider>
          <WishlistProvider>
            <AdminProvider>
            <Suspense fallback={
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh',
                gap: 2
              }}>
                <CircularProgress size={60} color="primary" />
                <Typography variant="h6" color="textSecondary">
                  Loading Clinique Beauty...
                </Typography>
              </Box>
            }>
              <Outlet />
            </Suspense>
          </AdminProvider>
        </WishlistProvider>
      </CartProvider>
      </CategoryProvider>
    </MUIThemeProvider>
  );
}

export default App;
