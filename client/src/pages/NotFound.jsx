// client/src/pages/NotFound.jsx
// Standard 404 Not Found page aligned with theme styling and layout

import React, { useContext } from 'react';
import { Box, Container, Typography, Button, Paper } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { ThemeContext } from '../context/ThemeContext';

export default function NotFound() {
    const { colorValues } = useContext(ThemeContext);

    return (
        <Box
            sx={{
                minHeight: '80vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: colorValues.bgDefault,
                color: colorValues.textPrimary,
                py: 6,
                px: 2
            }}
        >
            <Container maxWidth="sm">
                <Paper
                    elevation={0}
                    sx={{
                        p: { xs: 4, sm: 6 },
                        textAlign: 'center',
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 3,
                        backgroundColor: colorValues.bgPaper
                    }}
                >
                    <Typography
                        variant="h1"
                        sx={{
                            fontWeight: 900,
                            fontSize: { xs: '4.5rem', sm: '6rem' },
                            lineHeight: 1,
                            color: colorValues.primary,
                            letterSpacing: -1,
                            mb: 1
                        }}
                    >
                        404
                    </Typography>

                    <Typography
                        variant="h5"
                        component="h2"
                        sx={{
                            fontWeight: 700,
                            mb: 1.5,
                            color: colorValues.textPrimary
                        }}
                    >
                        Page Not Found
                    </Typography>

                    <Typography
                        variant="body1"
                        sx={{
                            color: colorValues.textSecondary,
                            mb: 4,
                            maxWidth: 420,
                            mx: 'auto',
                            lineHeight: 1.6
                        }}
                    >
                        The page you are looking for does not exist, has been removed, or is temporarily unavailable.
                    </Typography>

                    <Button
                        component={RouterLink}
                        to="/"
                        variant="contained"
                        size="large"
                        sx={{
                            backgroundColor: colorValues.primary,
                            color: '#ffffff',
                            fontWeight: 600,
                            textTransform: 'none',
                            px: 4,
                            py: 1.2,
                            borderRadius: 1.5,
                            '&:hover': {
                                backgroundColor: colorValues.primaryDark
                            }
                        }}
                    >
                        Back to Homepage
                    </Button>
                </Paper>
            </Container>
        </Box>
    );
}
