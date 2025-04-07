import React, { useContext } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider as MUIThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import MainLayout from './layouts/MainLayout';
import Home from './features/home/Home';
import { ThemeContext } from './context/ThemeContext';

function App() {
  // Get the MUI theme from ThemeContext
  const { muiTheme } = useContext(ThemeContext);

  return (
    <MUIThemeProvider theme={muiTheme}>
      <CssBaseline />
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          {/* Add other routes here */}
        </Route>
      </Routes>
    </MUIThemeProvider>
  );
}

export default App;
