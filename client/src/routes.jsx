import React, { useEffect } from 'react';
import { createBrowserRouter, RouterProvider, useNavigate } from 'react-router-dom';
import { useUser, useAuth } from '@clerk/clerk-react';
import { CircularProgress, Box, Typography } from '@mui/material';
import { toast } from 'react-hot-toast';
import App from './App.jsx';
import Home from './features/home/Home.jsx';
import Cart from './features/cart/Cart.jsx';
import { RequireAuth, RedirectIfAuthenticated } from './middleware.jsx';
import MainLayout from './layouts/MainLayout.jsx';
import { RouteErrorElement } from './components/ErrorBoundary.jsx';
import Skincare from './features/products/pages/Skincare';
import Makeup from './features/products/pages/Makeup';
import Fragrance from './features/products/pages/Fragrance';
import HairProducts from './features/products/pages/HairProducts';
import ProductDetail from './features/products/ProductDetail';
import AdminLayout from './features/admin/layout/AdminLayout';
import AdminDashboard from './features/admin/pages/Dashboard';
import AdminProducts from './features/admin/pages/Products';
import AdminOrders from './features/admin/pages/Orders';
import AdminUsers from './features/admin/pages/Users';
import AdminSettings from './features/admin/pages/Settings';
import AdminSetup from './features/admin/pages/AdminSetup';

// Lazy-load these components for better performance
const Login = React.lazy(() => import('./features/auth/Login.jsx'));
const Register = React.lazy(() => import('./features/auth/Register.jsx'));
const ClerkVerification = React.lazy(() => import('./features/auth/ClerkVerification.jsx'));

// RequireAdmin component to protect admin routes
const RequireAdmin = ({ children }) => {
    const { isSignedIn, isLoaded } = useUser();
    const { user } = useAuth();
    const navigate = useNavigate();
    
    useEffect(() => {
        const checkAdmin = async () => {
            if (isLoaded && isSignedIn) {
                // Check if user has admin role (stored in publicMetadata)
                const isAdmin = user?.publicMetadata?.role === 'admin';
                
                if (!isAdmin) {
                    toast.error('Access denied: Admin privileges required');
                    navigate('/');
                }
            } else if (isLoaded && !isSignedIn) {
                toast.error('Please sign in to access the admin panel');
                navigate('/auth/login?redirect=/admin');
            }
        };
        
        checkAdmin();
    }, [isLoaded, isSignedIn, navigate, user]);
    
    if (!isLoaded) return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <CircularProgress />
            <Typography variant="h6" sx={{ ml: 2 }}>Loading authentication...</Typography>
        </Box>
    );
    
    return isSignedIn ? children : null;
};

// Export the router instance directly
export const router = createBrowserRouter([
    {
        path: '/',
        element: <App />,
        errorElement: <RouteErrorElement />,
        children: [
            // Auth routes might live here, outside MainLayout
            {
                path: '/auth/login',
                element: <RedirectIfAuthenticated><Login /></RedirectIfAuthenticated>
            },
            {
                path: '/auth/login/factor-one',
                element: <ClerkVerification type="factorOne" />
            },
            {
                path: '/auth/login/factor-two',
                element: <ClerkVerification type="factorTwo" />
            },
            // Add the missing SSO callback route for login
            {
                path: '/auth/login/sso-callback',
                element: <ClerkVerification type="ssoCallback" />
            },
            {
                path: '/auth/register/*',
                element: <RedirectIfAuthenticated><Register /></RedirectIfAuthenticated>
            },
            { path: '/auth/register/verify-email-address', element: <ClerkVerification type="verifyEmail" /> },
            { path: '/auth/register/sso-callback', element: <Register /> },
            { path: '/auth/verify', element: <ClerkVerification type="verify" /> },
            { path: '/auth/reset-password', element: <ClerkVerification type="resetPassword" /> },

            // Main layout route - renders Navbar/Footer + Outlet for its children
            {
                path: '/', // Matches the root and subsequent paths
                element: <MainLayout />,
                errorElement: <RouteErrorElement />,
                children: [
                    // Routes rendered within MainLayout's Outlet
                    { index: true, element: <Home /> }, // Use index route for home
                    { path: '/cart', element: <RequireAuth><Cart /></RequireAuth> },
                    { path: '/products/skincare', element: <Skincare /> },
                    { path: '/products/makeup', element: <Makeup /> },
                    { path: '/products/fragrance', element: <Fragrance /> },
                    { path: '/products/hair', element: <HairProducts /> },
                    // Correct path for product detail
                    { path: '/product/:id', element: <ProductDetail /> },
                    // Remove the duplicate /products/:id route
                    // { path: '/products/:id', element: <ProductDetail /> },
                    // ... other routes needing MainLayout ...
                    // { path: '/checkout', element: <RequireAuth><Checkout /></RequireAuth> },
                    // { path: '/profile', element: <RequireAuth><Profile /></RequireAuth> },
                    // { path: '/search', element: <Search /> },
                    // Consider adding a NotFound route here
                    // { path: '*', element: <NotFound /> },
                ]
            },
            // Admin Setup Route (protected but doesn't require admin role)
            {
                path: '/admin-setup',
                element: <RequireAuth><AdminSetup /></RequireAuth>,
            },
            // Admin Routes
            {
                path: '/admin',
                element: <RequireAdmin><AdminLayout /></RequireAdmin>,
                children: [
                    { index: true, element: <AdminDashboard /> },
                    { path: 'products', element: <AdminProducts /> },
                    { path: 'orders', element: <AdminOrders /> },
                    { path: 'users', element: <AdminUsers /> },
                    { path: 'settings', element: <AdminSettings /> },
                ]
            },
            // Add other routes that *don't* need MainLayout here
            // e.g., { path: '/admin', element: <AdminLayout />, children: [...] }
        ]
    }
]);
