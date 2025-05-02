import React, { useState, useEffect, useContext } from 'react';
import { Snackbar, Alert, Button, Typography, Box } from '@mui/material';
import { ThemeContext } from '../context/ThemeContext';
import { useApi } from '../api/apiClient';

function ConnectionStatus() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [backendError, setBackendError] = useState(false);
  const [open, setOpen] = useState(false);
  const { colorValues } = useContext(ThemeContext);
  const api = useApi();

  // Check connection to backend
  useEffect(() => {
    const checkBackendConnection = async () => {
      if (navigator.onLine) {
        try {
          // Try a lightweight API call to verify backend connection
          await api.getHealthCheck(); 
          setBackendError(false);
        } catch (error) {
          console.error('Backend connection error:', error);
          setBackendError(true);
          setOpen(true);
        }
      }
    };

    // Check initially
    checkBackendConnection();

    // Check periodically
    const interval = setInterval(checkBackendConnection, 30000);
    return () => clearInterval(interval);
  }, [api]);

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      // When we come back online, check the backend too
      api.getHealthCheck().catch(() => {
        setBackendError(true);
        setOpen(true);
      });
    };
    
    const handleOffline = () => {
      setIsOffline(true);
      setOpen(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [api]);

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setOpen(false);
  };

  const handleRetry = async () => {
    setOpen(false);
    
    // Wait a moment before retrying
    setTimeout(async () => {
      try {
        await api.getHealthCheck();
        setBackendError(false);
      } catch (error) {
        setBackendError(true);
        setOpen(true);
      }
    }, 1000);
  };

  const message = isOffline 
    ? "You're offline. Some features may be unavailable."
    : backendError 
      ? "Cannot connect to the server. Using cached data where available."
      : "";

  if (!isOffline && !backendError) return null;

  return (
    <Snackbar
      open={open}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      sx={{ mt: 8 }} // Position below app bar
    >
      <Alert 
        severity={isOffline ? "warning" : "error"}
        sx={{ 
          width: '100%',
          backgroundColor: colorValues.bgPaper,
          color: colorValues.textPrimary,
          border: `1px solid ${isOffline ? '#f57c00' : '#d32f2f'}`
        }}
        action={
          <Button 
            color="inherit" 
            size="small" 
            onClick={handleRetry}
            sx={{ fontWeight: 500 }}
          >
            Retry
          </Button>
        }
      >
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {message}
          </Typography>
          <Typography variant="caption" component="div" sx={{ mt: 0.5 }}>
            {isOffline ? "Check your internet connection" : "Local data will be synced when connection is restored"}
          </Typography>
        </Box>
      </Alert>
    </Snackbar>
  );
}

export default ConnectionStatus;
