import React from 'react';
import { 
    Box, 
    Typography, 
    Paper, 
    Grid, 
    Divider,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Chip
} from '@mui/material';
import {
    MailOutline,
    OpenInBrowser,
    TouchApp,
    ShoppingCart,
    TrendingUp,
    TrendingDown,
    Cancel
} from '@mui/icons-material';
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    Legend, 
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line
} from 'recharts';
import { useContext } from 'react';
import { ThemeContext } from '../../../../context/ThemeContext';

// Custom tooltip for email metrics
const CustomTooltip = ({ active, payload, label, valuePrefix = '', valueSuffix = '' }) => {
    const { colorValues } = useContext(ThemeContext);
    
    if (active && payload && payload.length) {
        return (
            <Paper
                elevation={3}
                sx={{
                    bgcolor: colorValues.bgPaper,
                    p: 2,
                    border: `1px solid ${colorValues.border}`,
                    borderRadius: 1
                }}
            >
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 'bold' }}>
                    {label}
                </Typography>
                {payload.map((entry, index) => (
                    <Typography 
                        key={`item-${index}`} 
                        variant="body2" 
                        sx={{ 
                            color: entry.color,
                            display: 'flex',
                            alignItems: 'center'
                        }}
                    >
                        <Box 
                            component="span" 
                            sx={{ 
                                display: 'inline-block', 
                                width: 10, 
                                height: 10, 
                                bgcolor: entry.color,
                                borderRadius: '50%',
                                mr: 1
                            }} 
                        />
                        {entry.name}: {valuePrefix}{entry.value.toLocaleString()}{valueSuffix}
                    </Typography>
                ))}
            </Paper>
        );
    }
    
    return null;
};

// Status indicator component
const StatusIndicator = ({ value, threshold = 0, positiveLabel = 'Good', negativeLabel = 'Needs Improvement' }) => {
    const positive = value >= threshold;
    return (
        <Chip
            icon={positive ? <TrendingUp /> : <TrendingDown />}
            label={positive ? positiveLabel : negativeLabel}
            color={positive ? 'success' : 'warning'}
            size="small"
            sx={{ ml: 1 }}
        />
    );
};

const EmailCampaignStats = ({ campaignData }) => {
    const { theme, colorValues } = useContext(ThemeContext);
    
    // Bail out early if no data
    if (!campaignData) {
        return (
            <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="body1">No campaign data available</Typography>
            </Box>
        );
    }
    
    const { 
        summary, 
        performanceByMonth, 
        campaignTypes, 
        recentCampaigns 
    } = campaignData;
    
    const COLORS = [
        colorValues.primary, 
        colorValues.secondary, 
        colorValues.success, 
        colorValues.warning, 
        colorValues.info, 
        colorValues.error
    ];
    
    return (
        <Box>
            <Typography variant="h6" sx={{ mb: 3 }}>Email Marketing Performance</Typography>
            
            {/* Summary Stats */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Paper
                        elevation={theme === 'dark' ? 3 : 1}
                        sx={{
                            p: 2,
                            height: '100%',
                            bgcolor: colorValues.bgPaper,
                            borderRadius: 2,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center'
                        }}
                    >
                        <Box sx={{ 
                            p: 1, 
                            borderRadius: '50%', 
                            bgcolor: `${colorValues.primary}20`, 
                            display: 'flex',
                            justifyContent: 'center', 
                            alignItems: 'center',
                            mb: 1
                        }}>
                            <MailOutline sx={{ color: colorValues.primary, fontSize: 28 }} />
                        </Box>
                        <Typography variant="h4" align="center" sx={{ fontWeight: 'bold' }}>
                            {summary.totalSent.toLocaleString()}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" align="center">
                            Emails Sent
                        </Typography>
                    </Paper>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                    <Paper
                        elevation={theme === 'dark' ? 3 : 1}
                        sx={{
                            p: 2,
                            height: '100%',
                            bgcolor: colorValues.bgPaper,
                            borderRadius: 2,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center'
                        }}
                    >
                        <Box sx={{ 
                            p: 1, 
                            borderRadius: '50%', 
                            bgcolor: `${colorValues.info}20`, 
                            display: 'flex',
                            justifyContent: 'center', 
                            alignItems: 'center',
                            mb: 1
                        }}>
                            <OpenInBrowser sx={{ color: colorValues.info, fontSize: 28 }} />
                        </Box>
                        <Typography variant="h4" align="center" sx={{ fontWeight: 'bold' }}>
                            {summary.openRate}%
                        </Typography>
                        <Typography variant="body2" color="text.secondary" align="center" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            Open Rate
                            <StatusIndicator value={summary.openRate} threshold={20} />
                        </Typography>
                    </Paper>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                    <Paper
                        elevation={theme === 'dark' ? 3 : 1}
                        sx={{
                            p: 2,
                            height: '100%',
                            bgcolor: colorValues.bgPaper,
                            borderRadius: 2,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center'
                        }}
                    >
                        <Box sx={{ 
                            p: 1, 
                            borderRadius: '50%', 
                            bgcolor: `${colorValues.warning}20`, 
                            display: 'flex',
                            justifyContent: 'center', 
                            alignItems: 'center',
                            mb: 1
                        }}>
                            <TouchApp sx={{ color: colorValues.warning, fontSize: 28 }} />
                        </Box>
                        <Typography variant="h4" align="center" sx={{ fontWeight: 'bold' }}>
                            {summary.clickRate}%
                        </Typography>
                        <Typography variant="body2" color="text.secondary" align="center" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            Click Rate
                            <StatusIndicator value={summary.clickRate} threshold={3.5} />
                        </Typography>
                    </Paper>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                    <Paper
                        elevation={theme === 'dark' ? 3 : 1}
                        sx={{
                            p: 2,
                            height: '100%',
                            bgcolor: colorValues.bgPaper,
                            borderRadius: 2,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center'
                        }}
                    >
                        <Box sx={{ 
                            p: 1, 
                            borderRadius: '50%', 
                            bgcolor: `${colorValues.success}20`, 
                            display: 'flex',
                            justifyContent: 'center', 
                            alignItems: 'center',
                            mb: 1
                        }}>
                            <ShoppingCart sx={{ color: colorValues.success, fontSize: 28 }} />
                        </Box>
                        <Typography variant="h4" align="center" sx={{ fontWeight: 'bold' }}>
                            {summary.conversionRate}%
                        </Typography>
                        <Typography variant="body2" color="text.secondary" align="center" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            Conversion Rate
                            <StatusIndicator value={summary.conversionRate} threshold={1.2} />
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>
            
            {/* Performance Charts */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {/* Monthly Performance Trends */}
                <Grid item xs={12} md={8}>
                    <Paper
                        elevation={theme === 'dark' ? 3 : 1}
                        sx={{
                            p: 3,
                            height: '100%',
                            bgcolor: colorValues.bgPaper,
                            borderRadius: 2
                        }}
                    >
                        <Typography variant="subtitle1" sx={{ mb: 2 }}>Monthly Performance Trends</Typography>
                        <Box sx={{ height: 300 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart
                                    data={performanceByMonth}
                                    margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} />
                                    <XAxis 
                                        dataKey="month" 
                                        tick={{ fill: colorValues.text }}
                                    />
                                    <YAxis
                                        yAxisId="left"
                                        tickFormatter={(value) => `${value}%`}
                                        tick={{ fill: colorValues.text }}
                                    />
                                    <YAxis
                                        yAxisId="right"
                                        orientation="right"
                                        tickFormatter={(value) => `${value}K`}
                                        tick={{ fill: colorValues.text }}
                                    />
                                    <Tooltip 
                                        content={<CustomTooltip />}
                                    />
                                    <Legend />
                                    <Line
                                        yAxisId="left"
                                        type="monotone"
                                        dataKey="openRate"
                                        name="Open Rate"
                                        stroke={colorValues.info}
                                        activeDot={{ r: 8 }}
                                        strokeWidth={2}
                                        dot={{ stroke: colorValues.info, strokeWidth: 2, r: 4, fill: colorValues.bgPaper }}
                                        unit="%"
                                    />
                                    <Line
                                        yAxisId="left"
                                        type="monotone"
                                        dataKey="clickRate"
                                        name="Click Rate"
                                        stroke={colorValues.warning}
                                        activeDot={{ r: 8 }}
                                        strokeWidth={2}
                                        dot={{ stroke: colorValues.warning, strokeWidth: 2, r: 4, fill: colorValues.bgPaper }}
                                        unit="%"
                                    />
                                    <Line
                                        yAxisId="right"
                                        type="monotone"
                                        dataKey="totalSent"
                                        name="Emails Sent"
                                        stroke={colorValues.primary}
                                        activeDot={{ r: 8 }}
                                        strokeWidth={2}
                                        dot={{ stroke: colorValues.primary, strokeWidth: 2, r: 4, fill: colorValues.bgPaper }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </Box>
                    </Paper>
                </Grid>
                
                {/* Campaign Type Distribution */}
                <Grid item xs={12} md={4}>
                    <Paper
                        elevation={theme === 'dark' ? 3 : 1}
                        sx={{
                            p: 3,
                            height: '100%',
                            bgcolor: colorValues.bgPaper,
                            borderRadius: 2
                        }}
                    >
                        <Typography variant="subtitle1" sx={{ mb: 2 }}>Campaign Types</Typography>
                        <Box sx={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={campaignTypes}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {campaignTypes.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value, name) => [`${value} campaigns`, name]}
                                        contentStyle={{
                                            backgroundColor: colorValues.bgPaper,
                                            borderColor: colorValues.border,
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
            
            {/* Recent Campaigns */}
            <Paper
                elevation={theme === 'dark' ? 3 : 1}
                sx={{
                    p: 3,
                    bgcolor: colorValues.bgPaper,
                    borderRadius: 2
                }}
            >
                <Typography variant="subtitle1" sx={{ mb: 2 }}>Recent Campaigns</Typography>
                <List>
                    {recentCampaigns.map((campaign, index) => (
                        <React.Fragment key={campaign.id}>
                            <ListItem 
                                alignItems="flex-start"
                                sx={{ 
                                    py: 1.5, 
                                    px: 2,
                                    bgcolor: index % 2 === 0 ? 'transparent' : alpha(colorValues.text, 0.03),
                                    borderRadius: 1
                                }}
                            >
                                <ListItemIcon>
                                    {campaign.status === 'completed' ? (
                                        <MailOutline sx={{ color: colorValues.success }} />
                                    ) : campaign.status === 'in-progress' ? (
                                        <MailOutline sx={{ color: colorValues.warning }} />
                                    ) : (
                                        <Cancel sx={{ color: colorValues.error }} />
                                    )}
                                </ListItemIcon>
                                <ListItemText
                                    primary={
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Typography variant="subtitle2">
                                                {campaign.name}
                                            </Typography>
                                            <Chip 
                                                label={campaign.status} 
                                                size="small"
                                                color={
                                                    campaign.status === 'completed' ? 'success' : 
                                                    campaign.status === 'in-progress' ? 'warning' : 'error'
                                                }
                                            />
                                        </Box>
                                    }
                                    secondary={
                                        <React.Fragment>
                                            <Typography
                                                component="span"
                                                variant="body2"
                                                color="text.primary"
                                            >
                                                Sent: {campaign.sentCount.toLocaleString()} • 
                                                Opens: {campaign.openRate}% • 
                                                Clicks: {campaign.clickRate}%
                                            </Typography>
                                            <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                                                Sent on {new Date(campaign.sentDate).toLocaleDateString()}
                                            </Typography>
                                        </React.Fragment>
                                    }
                                />
                            </ListItem>
                            {index < recentCampaigns.length - 1 && <Divider component="li" />}
                        </React.Fragment>
                    ))}
                </List>
            </Paper>
        </Box>
    );
};

// Add alpha function to handle opacity in colors
const alpha = (color, opacity) => {
    // Handle undefined or null color values
    if (!color) return `rgba(0, 0, 0, ${opacity})`;
    
    // If color is already rgba, modify its opacity
    if (color.startsWith('rgba')) {
        return color.replace(/rgba\(([^,]+),([^,]+),([^,]+),[^)]+\)/, `rgba($1,$2,$3,${opacity})`);
    }
    
    // If color is hex
    if (color.startsWith('#')) {
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
    
    // Default fallback
    return color;
};

export default EmailCampaignStats;
