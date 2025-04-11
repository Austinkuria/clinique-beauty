import React from 'react';
import { Box, Container, Typography, Paper, CircularProgress } from "@mui/material";
import {
    SignUp,
    SignIn
} from "@clerk/clerk-react";

const ClerkVerification = ({ type }) => {
    return (
        <Container maxWidth="sm">
            <Box sx={{ my: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography component="h1" variant="h4" gutterBottom>
                    {type === 'verifyEmail' && 'Verify Email Address'}
                    {type === 'resetPassword' && 'Reset Your Password'}
                    {type === 'verify' && 'Verification'}
                    {type === 'factorOne' && 'Two-Step Verification'}
                    {type === 'factorTwo' && 'Additional Verification'}
                </Typography>
                <Paper elevation={3} sx={{ p: 3, width: '100%' }}>
                    {type === 'verifyEmail' && (
                        <SignUp
                            path="/auth/register"
                            routing="path"
                            signInUrl="/auth/login"
                            fallbackRedirectUrl="/"
                            appearance={{
                                elements: {
                                    formButtonPrimary: 'bg-primary hover:bg-primary-dark'
                                }
                            }}
                        />
                    )}

                    {type === 'resetPassword' && (
                        <SignIn
                            path="/auth/reset-password"
                            routing="path"
                            signUpUrl="/auth/register"
                            fallbackRedirectUrl="/"
                            initialStep="forgot_password"
                        />
                    )}

                    {/* Add support for factor-one authentication */}
                    {(type === 'factorOne' || type === 'factorTwo') && (
                        <SignIn
                            path="/auth/login"
                            routing="path"
                            signUpUrl="/auth/register"
                            fallbackRedirectUrl="/"
                        />
                    )}

                    {type === 'verify' && (
                        <Box sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            p: 2
                        }}>
                            <CircularProgress sx={{ mb: 2 }} />
                            <Typography>
                                Verifying your account...
                            </Typography>
                        </Box>
                    )}
                </Paper>
            </Box>
        </Container>
    );
};

export default ClerkVerification;
