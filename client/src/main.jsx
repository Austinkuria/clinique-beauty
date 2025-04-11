import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { ThemeProvider } from './context/ThemeContext';
import { ClerkProvider } from '@clerk/clerk-react';
// Make sure this import exists
import './styles/globals.css';

// Get the publishable key from environment variables
const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
            <ThemeProvider>
                <ClerkProvider publishableKey={publishableKey}>
                    <App />
                </ClerkProvider>
            </ThemeProvider>
        </BrowserRouter>
    </React.StrictMode>
);
