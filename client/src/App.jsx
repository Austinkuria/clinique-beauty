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

function App() {
  const { muiTheme } = useContext(ThemeContext);
  const { isLoaded, isSignedIn, user } = useUser();
  const { session } = useClerk();

  useInitializeApi();

  // Sync user to Supabase when they sign in
  useEffect(() => {
    const handleUserSync = async () => {
      if (isLoaded && isSignedIn && user) {
        try {
          console.log("App: Attempting to sync user to Supabase...");
          await syncUserToSupabase(user, session.getToken);
          console.log("App: User sync complete");
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
      <CartProvider>
        <WishlistProvider>
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
        </WishlistProvider>
      </CartProvider>
    </MUIThemeProvider>
  );
}

export default App;
