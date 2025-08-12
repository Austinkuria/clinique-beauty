import React, { useState, useEffect, useContext, useCallback } from 'react';
import { 
    Box, 
    Grid, 
    Paper, 
    Typography, 
    CircularProgress
} from '@mui/material';
import { ThemeContext } from '../../../../context/ThemeContext';
import { useApi } from '../../../../api/apiClient';
import { formatCurrency } from '../../../../utils/helpers';
import GeographicalChart from '../../components/charts/GeographicalChart';
import StatCard from '../../components/charts/StatCard';
import { Public as GlobeIcon, Language as RegionIcon, Flag as CountryIcon } from '@mui/icons-material';

function GeographicalAnalytics() {
    const { theme, colorValues } = useContext(ThemeContext);
    const api = useApi();
    const [loading, setLoading] = useState(true);
    const [geoData, setGeoData] = useState(null);
    
    const fetchGeoData = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.getDashboardData();
            
            if (response && response.data && response.data.geographicalData) {
                setGeoData(response.data.geographicalData);
            }
        } catch (error) {
            console.error('Error fetching geographical data:', error);
        } finally {
            setLoading(false);
        }
    }, [api]);
    
    useEffect(() => {
        fetchGeoData();
    }, [fetchGeoData]);
    
    if (loading || !geoData) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <CircularProgress />
            </Box>
        );
    }
    
    // Calculate some top-level geographical stats
    const totalInternationalRevenue = geoData.reduce((sum, country) => sum + country.revenue, 0);
    const topMarket = [...geoData].sort((a, b) => b.revenue - a.revenue)[0];
    const fastestGrowingMarket = [...geoData].sort((a, b) => b.growth - a.growth)[0];
    
    return (
        <Box>
            <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>Geographical Analytics</Typography>
            
            {/* Geographic Stats */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={4}>
                    <StatCard 
                        title="Total International Revenue" 
                        value={formatCurrency(totalInternationalRevenue)} 
                        icon={<GlobeIcon />} 
                        color="primary"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <StatCard 
                        title="Top Market" 
                        value={topMarket.country} 
                        icon={<CountryIcon />} 
                        color="success"
                        percentChange={topMarket.growth}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <StatCard 
                        title="Fastest Growing Market" 
                        value={fastestGrowingMarket.country} 
                        icon={<RegionIcon />} 
                        color="warning"
                        percentChange={fastestGrowingMarket.growth}
                    />
                </Grid>
            </Grid>
            
            {/* Main Geographical Chart Component */}
            <Paper
                elevation={theme === 'dark' ? 3 : 1}
                sx={{
                    p: 3,
                    bgcolor: colorValues.bgPaper,
                    borderRadius: 2
                }}
            >
                <GeographicalChart geographicalData={geoData} />
            </Paper>
        </Box>
    );
}

export default GeographicalAnalytics;
