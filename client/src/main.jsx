import React, { useContext } from 'react';
import ReactDOM from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import { ThemeProvider, ThemeContext } from './context/ThemeContext.jsx';
// Remove CartProvider and WishlistProvider imports from here
// import { CartProvider } from './context/CartContext.jsx';
// import { WishlistProvider } from './context/WishlistContext.jsx';
import { router } from './routes';
import ErrorBoundary from './components/ErrorBoundary';
import ThemedToaster from './components/ThemedToaster.jsx';
import './index.css';
import { RouterProvider } from 'react-router-dom';

// Clerk Publishable Key
const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
    throw new Error("Missing Clerk Publishable Key");
}

// New component to access ThemeContext and configure Clerk
function AppCore() {
    const { theme, colorValues } = useContext(ThemeContext);

    // Define Clerk appearance using direct color values from context
    const clerkAppearance = {
        baseTheme: theme === 'dark' ? 'dark' : 'light', // Use Clerk's base themes
        variables: {
            colorPrimary: colorValues.primary,
            colorText: colorValues.textPrimary,
            colorBackground: colorValues.bgPaper,
            colorInputBackground: theme === 'dark' ? '#333333' : '#f5f5f5', // Example
            colorInputText: colorValues.textPrimary, // Example
            colorTextSecondary: colorValues.textSecondary,
            colorDanger: theme === 'light' ? '#d32f2f' : '#ef5350', // Example error color
            colorSuccess: theme === 'light' ? '#2e7d32' : '#66bb6a', // Example success color
        },
        elements: {
            // Style elements common to SignIn, SignUp, UserButton etc.
            card: {
                backgroundColor: colorValues.bgPaper,
                boxShadow: theme === 'dark' ? '0 4px 12px rgba(0, 0, 0, 0.5)' : '0 4px 12px rgba(0, 0, 0, 0.1)',
                borderRadius: '8px',
            }, // <-- Added missing closing brace and comma
            formButtonPrimary: {
                backgroundColor: colorValues.primary,
                '&:hover': {
                    backgroundColor: colorValues.primaryDark,
                },
                '&:focus': {
                    backgroundColor: colorValues.primaryDark, // Ensure focus state is handled
                },
                '&:active': {
                    backgroundColor: colorValues.primaryDark, // Ensure active state is handled
                },
                borderRadius: '50px',
                textTransform: 'none',
            },
            footerActionLink: {
                color: colorValues.primary,
                '&:hover': {
                    color: colorValues.primaryLight,
                },
                fontWeight: 500,
            },
            formFieldInput: {
                backgroundColor: theme === 'dark' ? '#333333' : '#f5f5f5', // Match variable
                color: colorValues.textPrimary,
                borderColor: theme === 'dark' ? '#555' : '#ccc', // Example border
                '&:focus': {
                    borderColor: colorValues.primary, // Highlight focus with primary color
                    boxShadow: `0 0 0 1px ${colorValues.primary}`, // Add focus ring
                }
            },
            // Specific styles for UserButton if needed (can override Navbar's)
            userButtonAvatarBox: {
                width: '2.2rem',
                height: '2.2rem',
                border: theme === 'dark' ? `2px solid ${colorValues.primary}` : 'none',
            },
        },
    };

    return (
        <ClerkProvider
            publishableKey={publishableKey}
            appearance={clerkAppearance} // Pass the dynamic appearance object
        >
            {/* Remove CartProvider and WishlistProvider from here */}
            {/* Render RouterProvider directly */}
            <RouterProvider router={router} />
            <ThemedToaster />
            {/* Remove CartProvider and WishlistProvider from here */}
        </ClerkProvider>
    );
}


ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <ErrorBoundary>
            {/* ThemeProvider now wraps the component that uses its context */}
            <ThemeProvider>
                <AppCore />
            </ThemeProvider>
        </ErrorBoundary>
    </React.StrictMode>
);
