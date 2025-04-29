import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
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
            // Add other routes that *don't* need MainLayout here
            // e.g., { path: '/admin', element: <AdminLayout />, children: [...] }
        ]
    }
]);
