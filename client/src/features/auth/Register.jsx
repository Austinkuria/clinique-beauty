import { SignUp } from "@clerk/clerk-react";
import { Box, Container, Typography, Paper } from "@mui/material";

const Register = () => {
    return (
        <Container maxWidth="sm">
            <Box sx={{ my: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography component="h1" variant="h4" gutterBottom>
                    Create Your Account
                </Typography>
                <Paper elevation={3} sx={{ p: 3, width: '100%' }}>
                    <SignUp
                        path="/auth/register"
                        routing="path"
                        signInUrl="/auth/login"
                        afterSignUpUrl="/"
                        fallbackRedirectUrl="/"
                    />
                </Paper>
            </Box>
        </Container>
    );
};

export default Register;
