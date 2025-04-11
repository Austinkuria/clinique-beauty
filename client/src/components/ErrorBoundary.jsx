import React from 'react';
import {
    Box,
    Container,
    Typography,
    Button,
    Paper,
    Stack
} from '@mui/material';
import { useRouteError, isRouteErrorResponse, useNavigate } from 'react-router-dom';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

// For use as an error element in routes
export function RouteErrorElement() {
    const error = useRouteError();
    const navigate = useNavigate();

    let errorMessage = 'An unexpected error occurred';
    let statusText = 'Error';

    if (isRouteErrorResponse(error)) {
        errorMessage = error.data?.message || error.statusText;
        statusText = `${error.status} ${error.statusText}`;
    } else if (error instanceof Error) {
        errorMessage = error.message;
        // If we have a stack trace, log it to console for debugging
        if (error.stack) console.error(error.stack);
    }

    return (
        <Container maxWidth="md">
            <Paper
                elevation={3}
                sx={{
                    p: 4,
                    mt: 8,
                    borderRadius: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                }}
            >
                <ErrorOutlineIcon color="error" sx={{ fontSize: 60, mb: 2 }} />

                <Typography variant="h4" component="h1" gutterBottom>
                    {statusText}
                </Typography>

                <Typography variant="body1" color="text.secondary" sx={{ mb: 4, textAlign: 'center' }}>
                    {errorMessage}
                </Typography>

                <Stack direction="row" spacing={2}>
                    <Button
                        variant="outlined"
                        onClick={() => navigate(-1)}
                    >
                        Go Back
                    </Button>
                    <Button
                        variant="contained"
                        onClick={() => navigate('/', { replace: true })}
                    >
                        Go to Homepage
                    </Button>
                </Stack>
            </Paper>
        </Container>
    );
}

// For wrapping components that might error
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Error caught by boundary:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                    <ErrorOutlineIcon color="error" sx={{ fontSize: 60, mb: 2 }} />
                    <Typography variant="h5" component="h2" gutterBottom>
                        Something went wrong!
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                        {this.state.error?.message || 'An unexpected error occurred'}
                    </Typography>
                    <Button
                        variant="contained"
                        onClick={() => window.location.reload()}
                    >
                        Reload Page
                    </Button>
                </Box>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
