import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App.jsx';
import Home from './features/home/Home.jsx';
import Cart from './features/cart/Cart.jsx';
import { RequireAuth, RedirectIfAuthenticated } from './middleware.jsx';
import MainLayout from './layouts/MainLayout.jsx';
import { RouteErrorElement } from './components/ErrorBoundary.jsx';

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
                    {
                        path: '/auth/register',
                        element: <RedirectIfAuthenticated><Register /></RedirectIfAuthenticated>
                    },
                    // Clerk verification routes
                    { path: '/auth/register/verify-email-address', element: <ClerkVerification type="verifyEmail" /> },
                    { path: '/auth/verify', element: <ClerkVerification type="verify" /> },
                    { path: '/auth/reset-password', element: <ClerkVerification type="resetPassword" /> },
                    // Add more routes as they're implemented
                    // { path: '/products', element: <ProductList /> },
                    // { path: '/products/:id', element: <ProductDetail /> },
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
