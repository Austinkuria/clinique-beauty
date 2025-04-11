import React, { useContext, Suspense } from 'react';
import { Outlet, Routes, Route } from 'react-router-dom';
import { ThemeProvider as MUIThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeContext } from './context/ThemeContext';
import { Box, CircularProgress } from '@mui/material';
import SearchResults from './features/search/SearchResults';

function App() {
  // Get the MUI theme from ThemeContext
  const { muiTheme } = useContext(ThemeContext);

  return (
    <MUIThemeProvider theme={muiTheme}>
      <CssBaseline />
      <Suspense fallback={
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <CircularProgress />
        </Box>
      }>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="/search" element={<SearchResults />} />
          </Route>
        </Routes>
        <Outlet />
      </Suspense>
    </MUIThemeProvider>
  );
}

export default App;
