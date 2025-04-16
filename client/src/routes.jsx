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

const router = createBrowserRouter([
    {
        path: '/',
        element: <App />,
        errorElement: <RouteErrorElement />,
        children: [
            // Main layout with navbar and footer
            {
                path: '/',
                element: <MainLayout />,
                errorElement: <RouteErrorElement />,
                children: [
                    { path: '/', element: <Home /> },
                    // Protected route
                    { path: '/cart', element: <RequireAuth><Cart /></RequireAuth> },
                    // Auth routes - redirect if already signed in
                    {
                        path: '/auth/login',
                        element: <RedirectIfAuthenticated><Login /></RedirectIfAuthenticated>
                    },
                    // Add support for Clerk's multi-factor authentication 
                    {
                        path: '/auth/login/factor-one',
                        element: <ClerkVerification type="factorOne" />
                    },
                    {
                        path: '/auth/login/factor-two',
                        element: <ClerkVerification type="factorTwo" />
                    },
                    {
                        path: '/auth/register',
                        element: <RedirectIfAuthenticated><Register /></RedirectIfAuthenticated>
                    },
                    // Clerk verification routes
                    { path: '/auth/register/verify-email-address', element: <ClerkVerification type="verifyEmail" /> },
                    // Add route for Clerk SSO callback during registration
                    { path: '/auth/register/sso-callback', element: <Register /> },
                    { path: '/auth/verify', element: <ClerkVerification type="verify" /> },
                    { path: '/auth/reset-password', element: <ClerkVerification type="resetPassword" /> },
                    { path: '/products/skincare', element: <Skincare /> },
                    { path: '/products/makeup', element: <Makeup /> },
                    { path: '/products/fragrance', element: <Fragrance /> },
                    { path: '/products/hair', element: <HairProducts /> },
                    // { path: '/products', element: <ProductList /> },
                    { path: '/products/:id', element: <ProductDetail /> },
                    // { path: '/checkout', element: <RequireAuth><Checkout /></RequireAuth> },
                    // { path: '/profile', element: <RequireAuth><Profile /></RequireAuth> },
                    // { path: '/search', element: <Search /> },
                    // { path: '*', element: <NotFound /> },
                ]
            }
        ]
    }
]);

export default function Routes() {
    return (
        <RouterProvider router={router} />
    );
}
