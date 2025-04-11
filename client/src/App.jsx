import React, { useContext } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider as MUIThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import MainLayout from './layouts/MainLayout';
import Home from './features/home/Home';
import Login from './features/auth/Login';
import Register from './features/auth/Register';
import Cart from './features/cart/Cart';
import { ThemeContext } from './context/ThemeContext';
import { RequireAuth, RedirectIfAuthenticated } from './middleware';

function App() {
  // Get the MUI theme from ThemeContext
  const { muiTheme } = useContext(ThemeContext);

  return (
    <MUIThemeProvider theme={muiTheme}>
      <CssBaseline />
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="auth/login" element={<RedirectIfAuthenticated><Login /></RedirectIfAuthenticated>} />
          <Route path="auth/register" element={<RedirectIfAuthenticated><Register /></RedirectIfAuthenticated>} />
          <Route path="cart" element={<RequireAuth><Cart /></RequireAuth>} />
          {/* ...other protected routes... */}
        </Route>
      </Routes>
    </MUIThemeProvider>
  );
}

export default App;
