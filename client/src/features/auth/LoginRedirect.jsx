import React, { useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';

export default function LoginRedirect() {
    const { isLoaded, isSignedIn, user } = useUser();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isLoaded) return;
        if (!isSignedIn) {
            navigate('/auth/login', { replace: true });
            return;
        }

        const role = (
            user?.unsafeMetadata?.role ||
            user?.publicMetadata?.role ||
            localStorage.getItem('userRole') ||
            (localStorage.getItem('userIsAdmin') === 'true' ? 'admin' : '') ||
            ''
        ).toLowerCase();

        if (role === 'admin') {
            navigate('/admin', { replace: true });
        } else if (role === 'seller') {
            navigate('/seller', { replace: true });
        } else {
            navigate('/', { replace: true });
        }
    }, [isLoaded, isSignedIn, user, navigate]);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 2 }}>
            <CircularProgress color="primary" />
            <Typography variant="body1" color="text.secondary">
                Signing you in...
            </Typography>
        </Box>
    );
}
