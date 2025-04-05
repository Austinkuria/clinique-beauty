import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from './context/ThemeContext.jsx';
import Routes from './routes.jsx';
import './styles/globals.css';

ReactDOM.createRoot(document.getElementById('root')).render(
<React.StrictMode>
    <ThemeProvider>
        <Routes />
    </ThemeProvider>
</React.StrictMode>
);
