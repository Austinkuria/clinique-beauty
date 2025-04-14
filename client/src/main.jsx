import React from 'react';
import ReactDOM from 'react-dom/client';
import Routes from './routes';
import { ThemeProvider } from './context/ThemeContext';
import { CartProvider } from './context/CartContext';
import { ClerkProvider } from '@clerk/clerk-react';
import ErrorBoundary from './components/ErrorBoundary';
import { clerkAppearance } from './features/auth/ClerkConfiguration';
import { WishlistProvider } from './context/WishlistContext'; // Import WishlistProvider
import './styles/globals.css';

// Get the publishable key from environment variables
const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
    console.error("Missing VITE_CLERK_PUBLISHABLE_KEY environment variable");
}

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <ErrorBoundary>
            <ThemeProvider>
                <ClerkProvider
                    publishableKey={publishableKey}
                    appearance={clerkAppearance}
                >
                    <CartProvider>
                        <WishlistProvider> {/* Wrap with WishlistProvider */}
                            <Routes />
                        </WishlistProvider>
                    </CartProvider>
                </ClerkProvider>
            </ThemeProvider>
        </ErrorBoundary>
    </React.StrictMode>
);
