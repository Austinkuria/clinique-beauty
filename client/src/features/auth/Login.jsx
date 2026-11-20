import { SignIn } from "@clerk/clerk-react";
import { Box, Container, Typography, Paper } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";

const Login = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    // Get redirect path from query parameters
    const queryParams = new URLSearchParams(location.search);
    const redirectPath = queryParams.get('redirect');
    const targetUrl = redirectPath || '/auth/login-redirect';
    
    // In your component where you handle successful login
    const handleLoginSuccess = () => {
        navigate(targetUrl);
    };

    return (
        <Container maxWidth="sm">
            <Box sx={{ my: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography component="h1" variant="h4" gutterBottom>
                    Sign In to Your Account
                </Typography>
                <Paper elevation={3} sx={{ p: 3, width: '100%' }}>
                    <SignIn
                        path="/auth/login"
                        routing="path"
                        signUpUrl="/auth/register"
                        fallbackRedirectUrl={targetUrl}
                        forceRedirectUrl={redirectPath || undefined}
                        onSignIn={handleLoginSuccess}
                    />
                </Paper>
            </Box>
        </Container>
    );
};

export default Login;
