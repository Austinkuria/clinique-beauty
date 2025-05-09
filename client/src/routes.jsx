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
import CheckoutPage from './features/checkout/Checkout.jsx'; // Import the Checkout component
import CheckoutConfirmation from './features/checkout/CheckoutConfirmation.jsx'; // Import the confirmation component
import AdminLayout from './features/admin/layout/AdminLayout';
import AdminDashboard from './features/admin/pages/Dashboard';
import AdminProducts from './features/admin/pages/Products';
import AdminOrders from './features/admin/pages/Orders';
import AdminUsers from './features/admin/pages/Users';
import AdminSettings from './features/admin/pages/Settings';
import AdminSetup from './features/admin/pages/AdminSetup';
import AdminGuard from './components/AdminGuard';
import RevenueAnalytics from './features/admin/pages/analytics/RevenueAnalytics';
import ProductAnalytics from './features/admin/pages/analytics/ProductAnalytics';
import CustomerAnalytics from './features/admin/pages/analytics/CustomerAnalytics';
import GeographicalAnalytics from './features/admin/pages/analytics/GeographicalAnalytics';
import { useTheme } from '@mui/material/styles';

// Lazy-load these components for better performance
const Login = React.lazy(() => import('./features/auth/Login.jsx'));
const Register = React.lazy(() => import('./features/auth/Register.jsx'));
const ClerkVerification = React.lazy(() => import('./features/auth/ClerkVerification.jsx'));

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
                element: <RedirectIfAuthenticated><Login /></RedirectIfAuthenticated>,
            },
            {
                path: '/auth/login/factor-one',
                element: <ClerkVerification type="factorOne" />,
            },
            {
                path: '/auth/login/factor-two',
                element: <ClerkVerification type="factorTwo" />
            },
            // Add the missing SSO callback route for login
            {
                path: '/auth/login/sso-callback',
                element: <ClerkVerification type="ssoCallback" />,
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
                    // Checkout routes
                    { path: '/checkout', element: <RequireAuth><CheckoutPage /></RequireAuth> },
                    { path: '/checkout/confirmation', element: <RequireAuth><CheckoutConfirmation /></RequireAuth> },
                    // ... other routes needing MainLayout ...
                ]
            },
            // Admin Setup Route (protected but doesn't require admin role)
            {
                path: '/admin-setup',
                element: <RequireAuth><AdminSetup /></RequireAuth>,
            },
            // Admin Routes with AdminGuard
            {
                path: '/admin',
                element: <AdminGuard><AdminLayout /></AdminGuard>,
                children: [
                    { index: true, element: <AdminDashboard /> },
                    { path: 'products', element: <AdminProducts /> },
                    { path: 'orders', element: <AdminOrders /> },
                    { path: 'users', element: <AdminUsers /> },
                    { path: 'settings', element: <AdminSettings /> },
                    // New Analytics Routes
                    { path: 'analytics/revenue', element: <RevenueAnalytics /> },
                    { path: 'analytics/products', element: <ProductAnalytics /> },
                    { path: 'analytics/customers', element: <CustomerAnalytics /> },
                    { path: 'analytics/geographical', element: <GeographicalAnalytics /> },
                ]
            },
            // Add other routes that *don't* need MainLayout here
            // e.g., { path: '/admin', element: <AdminLayout />, children: [...] }
        ]
    }
]);
