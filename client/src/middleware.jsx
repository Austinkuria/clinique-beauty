import { useAuth } from '@clerk/clerk-react';
import { Navigate } from 'react-router-dom';

// Component to protect routes that require authentication
export const RequireAuth = ({ children }) => {
    const { isLoaded, isSignedIn } = useAuth();

    if (!isLoaded) {
        return <div>Loading...</div>;
    }

    if (!isSignedIn) {
        return <Navigate to="/auth/login" replace />;
    }

    return children;
};

// Component to redirect authenticated users away from auth pages
export const RedirectIfAuthenticated = ({ children }) => {
    const { isLoaded, isSignedIn } = useAuth();

    if (!isLoaded) {
        return <div>Loading...</div>;
    }

    if (isSignedIn) {
        return <Navigate to="/" replace />;
    }

    return children;
};
