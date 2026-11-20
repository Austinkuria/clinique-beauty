import { useAuth, useUser } from '@clerk/clerk-react';
import { Navigate, useLocation } from 'react-router-dom';

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

// Component to redirect authenticated users away from auth pages to their respective dashboards
export const RedirectIfAuthenticated = ({ children }) => {
    const { isLoaded, isSignedIn } = useAuth();
    const { user } = useUser();
    const location = useLocation();

    if (!isLoaded) {
        return <div>Loading...</div>;
    }

    if (isSignedIn) {
        const queryParams = new URLSearchParams(location.search);
        const redirectParam = queryParams.get('redirect');
        if (redirectParam && redirectParam !== '/auth/login' && !redirectParam.startsWith('/auth/')) {
            return <Navigate to={redirectParam} replace />;
        }

        const role = (
            user?.unsafeMetadata?.role ||
            user?.publicMetadata?.role ||
            localStorage.getItem('userRole') ||
            (localStorage.getItem('userIsAdmin') === 'true' ? 'admin' : '') ||
            ''
        ).toLowerCase();

        if (role === 'admin') {
            return <Navigate to="/admin" replace />;
        }
        if (role === 'seller') {
            return <Navigate to="/seller" replace />;
        }
        return <Navigate to="/" replace />;
    }

    return children;
};
