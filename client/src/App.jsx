import React, { useContext, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { ThemeProvider as MUIThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeContext } from './context/ThemeContext';
import { Box, CircularProgress } from '@mui/material';
// Import the context providers
import { CartProvider } from './context/CartContext.jsx';
import { WishlistProvider } from './context/WishlistContext.jsx';
import { useInitializeApi } from './api/apiClient'; // Import the initialization hook

function App() {
  // Get the MUI theme from ThemeContext
  const { muiTheme } = useContext(ThemeContext);

  // Call the hook here to ensure it runs when App mounts
  useInitializeApi();

  return (
    <MUIThemeProvider theme={muiTheme}>
      <CssBaseline />
      {/* Wrap Outlet with context providers */}
      <CartProvider>
        <WishlistProvider>
          <Suspense fallback={
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
              <CircularProgress />
            </Box>
          }>
            {/* Outlet renders the matched child route */}
            <Outlet />
          </Suspense>
        </WishlistProvider>
      </CartProvider>
    </MUIThemeProvider>
  );
}

export default App;
