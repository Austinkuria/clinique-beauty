import React, { useEffect } from 'react';
import { 
    SignIn, 
    useClerk,
    useUser
} from '@clerk/clerk-react';
import { Box, CircularProgress, Typography, Button } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { syncUserToSupabase } from '../../services/userSyncService';

function ClerkVerification({ type }) {
    const navigate = useNavigate();
    const location = useLocation();
    const { isLoaded, isSignedIn, user } = useUser();
    const { client, session } = useClerk();
    
    // Handle SSO callback and ensure user sync
    useEffect(() => {
        if (type === "ssoCallback" && isLoaded) {
            const redirectToHome = () => {
                // Extract redirect URL from query params if present
                const params = new URLSearchParams(location.search);
                const redirectUrl = params.get('redirect_url') || '/';
                
                // Navigate to the home page or specified redirect URL
                console.log("SSO authentication complete, redirecting to:", redirectUrl);
                setTimeout(() => navigate(redirectUrl, { replace: true }), 500);
            };
            
            // If signed in, attempt to sync the user and then redirect
            if (isSignedIn && user) {
                console.log("User signed in through SSO, syncing to database...");
                // Sync user to database
                const syncUser = async () => {
                    try {
                        await syncUserToSupabase(user, client.session.getToken);
                        toast.success("Sign in successful!");
                        redirectToHome();
                    } catch (error) {
                        console.error("Error syncing user:", error);
                        // Still redirect to avoid getting stuck, but show error
                        toast.error("Signed in, but failed to sync user data");
                        redirectToHome();
                    }
                };
                
                syncUser();
            } else if (!isSignedIn && isLoaded) {
                // If the user was not signed in but loading is complete,
                // something went wrong with the SSO flow
                console.log("SSO authentication failed or was canceled");
                toast.error("Authentication failed or was canceled");
                navigate('/auth/login');
            }
        }
    }, [type, isLoaded, isSignedIn, user, client, navigate, location.search]);
    
    // For SSO callback, show loading with recovery options
    if (type === "ssoCallback") {
        return (
            <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center', 
                justifyContent: 'center', 
                minHeight: '100vh',
                p: 2 
            }}>
                <CircularProgress size={60} sx={{ mb: 3 }} />
                <Typography variant="h5" sx={{ mb: 2 }}>
                    Completing sign in...
                </Typography>
                
                {/* Show a "stuck" message and recovery options after delay */}
                {isLoaded && (
                    <Box sx={{ mt: 4, textAlign: 'center' }}>
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                            Taking longer than expected?
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                            <Button variant="outlined" onClick={() => navigate('/')}>
                                Go to Home
                            </Button>
                            <Button variant="contained" onClick={() => navigate('/auth/login')}>
                                Try Again
                            </Button>
                        </Box>
                    </Box>
                )}
            </Box>
        );
    }
    
    // For all other verification types, render the appropriate Clerk component
    return (
        <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            minHeight: '100vh', 
            padding: 2 
        }}>
            {type === "factorOne" && (
                <SignIn path="/auth/login/factor-one" routing="path" />
            )}
            
            {type === "factorTwo" && (
                <SignIn path="/auth/login/factor-two" routing="path" />
            )}
            
            {type === "verifyEmail" && (
                <Box sx={{ textAlign: 'center', maxWidth: '400px' }}>
                    <CircularProgress sx={{ mb: 2 }} />
                    <Typography>
                        Please verify your email address. Check your inbox for a verification link.
                    </Typography>
                </Box>
            )}
            
            {type === "resetPassword" && (
                <SignIn path="/auth/reset-password" routing="path" initialStep="reset_password" />
            )}
            
            {type === "verify" && (
                <Box sx={{ textAlign: 'center' }}>
                    <CircularProgress />
                    <Typography variant="h6" sx={{ mt: 2 }}>
                        Verifying your account...
                    </Typography>
                </Box>
            )}
        </Box>
    );
}

export default ClerkVerification;
