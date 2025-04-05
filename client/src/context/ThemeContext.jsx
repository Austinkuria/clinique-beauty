import React, { createContext, useState, useEffect } from 'react';
export const ThemeContext = createContext();
export const ThemeProvider = ({ children }) => 
    { const [theme, setTheme] = useState('light'); 
        useEffect(() => { const savedTheme = localStorage.getItem('theme') || 'light'; setTheme(savedTheme); }, []);
        useEffect(() => { localStorage.setItem('theme', theme);
        }, [theme]); 
        const toggleTheme = () => { 
            setTheme(prev => prev === 'light' ? 'dark' : 'light');
         }; 
         return (
         <ThemeContext.Provider
          value={{ theme, toggleTheme }}>{children}
          </ThemeContext.Provider>
          ); 
          };
