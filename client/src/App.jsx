import React, { useContext, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { ThemeProvider as MUIThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeContext } from './context/ThemeContext';
import { Box, CircularProgress } from '@mui/material';
import { CartProvider } from './context/CartContext.jsx';
import { WishlistProvider } from './context/WishlistContext.jsx';
import { useInitializeApi } from './api/apiClient';

function App() {
  const { muiTheme } = useContext(ThemeContext);

  useInitializeApi();

  return (
    <MUIThemeProvider theme={muiTheme}>
      <CssBaseline />
      <CartProvider>
        <WishlistProvider>
          <Suspense fallback={
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
              <CircularProgress />
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
