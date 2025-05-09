import React, { useContext } from 'react';
import { Box, Paper, Typography, Avatar } from '@mui/material';
import { 
    TrendingUp as TrendingUpIcon, 
    TrendingDown as TrendingDownIcon 
} from '@mui/icons-material';
import { ThemeContext } from '../../../../context/ThemeContext';

const StatCard = ({ title, value, icon, color, percentChange }) => {
    const { theme, colorValues } = useContext(ThemeContext);
    
    return (
        <Paper
            elevation={theme === 'dark' ? 3 : 1}
            sx={{
                p: 2,
                height: '100%',
                bgcolor: colorValues.bgPaper,
                borderRadius: 2,
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: theme === 'dark' ? '0 8px 16px rgba(0,0,0,0.6)' : '0 8px 16px rgba(0,0,0,0.1)',
                }
            }}
        >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                    <Typography variant="subtitle2" color="textSecondary">{title}</Typography>
                    <Typography variant="h4" sx={{ mt: 1, fontWeight: 'bold' }}>
                        {title.includes('Revenue') ? `$${value.toLocaleString()}` : value.toLocaleString()}
                    </Typography>
                    
                    {percentChange && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                            {percentChange > 0 ? (
                                <TrendingUpIcon fontSize="small" sx={{ color: 'success.main', mr: 0.5 }} />
                            ) : (
                                <TrendingDownIcon fontSize="small" sx={{ color: 'error.main', mr: 0.5 }} />
                            )}
                            <Typography 
                                variant="body2" 
                                color={percentChange > 0 ? 'success.main' : 'error.main'}
                            >
                                {percentChange > 0 ? '+' : ''}{percentChange}% since last month
                            </Typography>
                        </Box>
                    )}
                </Box>
                <Avatar sx={{ bgcolor: `${color}.lighter`, color: `${color}.main`, p: 1 }}>
                    {icon}
                </Avatar>
            </Box>
        </Paper>
    );
};

export default StatCard;
