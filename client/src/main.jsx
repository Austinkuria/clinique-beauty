import React from 'react';
import ReactDOM from 'react-dom/client';
import Routes from './routes'; // Import Routes instead of App
import { ThemeProvider } from './context/ThemeContext';
import { CartProvider } from './context/CartContext';
import { ClerkProvider } from '@clerk/clerk-react';
import ErrorBoundary from './components/ErrorBoundary';
import './styles/globals.css';

// Get the publishable key from environment variables
const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <ErrorBoundary>
            <ThemeProvider>
                <CartProvider>
                    <ClerkProvider
                        publishableKey={publishableKey}
                        appearance={{
                            elements: {
                                formButtonPrimary: 'bg-primary hover:bg-primary-dark',
                                card: 'rounded-md shadow-md'
                            }
                        }}
                    >
                        <Routes />
                    </ClerkProvider>
                </CartProvider>
            </ThemeProvider>
        </ErrorBoundary>
    </React.StrictMode>
);
