import React, { useContext } from 'react';
import { IconButton, Tooltip, Box } from '@mui/material';
import { 
    LightMode as LightModeIcon, 
    DarkMode as DarkModeIcon 
} from '@mui/icons-material';
import { ThemeContext } from '../context/ThemeContext';

const ThemeToggle = ({ showLabel = false, size = "medium" }) => {
    const { theme, toggleTheme } = useContext(ThemeContext);

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {showLabel && (
                <Box sx={{ fontSize: '14px', color: 'text.secondary' }}>
                    Theme:
                </Box>
            )}
            <Tooltip title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
                <IconButton 
                    onClick={toggleTheme}
                    size={size}
                    sx={{ 
                        color: theme === 'light' ? 'primary.main' : 'secondary.main',
                        '&:hover': {
                            backgroundColor: theme === 'light' ? 'primary.lighter' : 'secondary.lighter'
                        }
                    }}
                >
                    {theme === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
                </IconButton>
            </Tooltip>
        </Box>
    );
};

export default ThemeToggle;
