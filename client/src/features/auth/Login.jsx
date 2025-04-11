import { SignIn } from "@clerk/clerk-react";
import { Box, Container, Typography, Paper } from "@mui/material";

const Login = () => {
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
                        fallbackRedirectUrl="/"
                    />
                </Paper>
            </Box>
        </Container>
    );
};

export default Login;
