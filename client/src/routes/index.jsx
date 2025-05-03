import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Layout from '../components/Layout';
import CartPage from '../pages/CartPage';
import { CartProvider } from '../context/CartContext';

// If you're using React Router, ensure the cart routes are wrapped with CartProvider
// Example:
const router = createBrowserRouter([
    {
        path: '/',
        element: <CartProvider><Layout /></CartProvider>, // Main layout should have CartProvider
        children: [
            // ...other routes...
            {
                path: 'cart',
                element: <CartPage />,
            },
            // ...other routes...
        ],
    },
]);

function App() {
    return (
        <RouterProvider router={router} />
    );
}

export default App;