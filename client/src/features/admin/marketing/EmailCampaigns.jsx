import React, { useState, useEffect } from 'react';
import { 
    Box, 
    Typography, 
    Paper, 
    Button, 
    Grid,
    CircularProgress,
    Alert
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../../../api/apiClient';
import EmailCampaignStats from '../components/charts/EmailCampaignStats';

const EmailCampaigns = () => {
    const navigate = useNavigate();
    const api = useApi();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [campaignData, setCampaignData] = useState(null);
    
    useEffect(() => {
        const fetchCampaignData = async () => {
            setLoading(true);
            try {
                // In a real application, this would fetch from your API
                // const response = await api.getEmailCampaignData();
                // setCampaignData(response.data);
                
                // Using mock data for demonstration
                setCampaignData({
                    summary: {
                        totalSent: 45680,
                        openRate: 24.8,
                        clickRate: 3.7,
                        conversionRate: 1.5
                    },
                    performanceByMonth: [
                        { month: 'Jan', openRate: 22.4, clickRate: 3.2, totalSent: 6.2 },
                        { month: 'Feb', openRate: 23.1, clickRate: 3.4, totalSent: 7.8 },
                        { month: 'Mar', openRate: 23.8, clickRate: 3.5, totalSent: 8.3 },
                        { month: 'Apr', openRate: 24.2, clickRate: 3.6, totalSent: 9.1 },
                        { month: 'May', openRate: 24.5, clickRate: 3.6, totalSent: 9.4 },
                        { month: 'Jun', openRate: 24.8, clickRate: 3.7, totalSent: 9.8 }
                    ],
                    campaignTypes: [
                        { name: 'Promotional', value: 42 },
                        { name: 'Newsletter', value: 28 },
                        { name: 'Product Launch', value: 15 },
                        { name: 'Abandoned Cart', value: 10 },
                        { name: 'Welcome Series', value: 5 }
                    ],
                    recentCampaigns: [
                        { 
                            id: 1, 
                            name: 'Summer Collection Launch', 
                            status: 'completed', 
                            sentCount: 12500, 
                            openRate: 27.3, 
                            clickRate: 4.2, 
                            sentDate: '2023-06-15' 
                        },
                        { 
                            id: 2, 
                            name: 'June Newsletter', 
                            status: 'completed', 
                            sentCount: 9800, 
                            openRate: 24.8, 
                            clickRate: 3.7, 
                            sentDate: '2023-06-05' 
                        },
                        { 
                            id: 3, 
                            name: 'Father\'s Day Promo', 
                            status: 'completed', 
                            sentCount: 11200, 
                            openRate: 26.1, 
                            clickRate: 4.0, 
                            sentDate: '2023-06-01' 
                        },
                        { 
                            id: 4, 
                            name: 'Summer Sale - 24h Flash', 
                            status: 'in-progress', 
                            sentCount: 5600, 
                            openRate: 22.8, 
                            clickRate: 3.4, 
                            sentDate: '2023-06-20' 
                        },
                        { 
                            id: 5, 
                            name: 'New Customer Welcome', 
                            status: 'in-progress', 
                            sentCount: 2800, 
                            openRate: 38.5, 
                            clickRate: 6.2, 
                            sentDate: '2023-06-18' 
                        }
                    ]
                });
                setError(null);
            } catch (err) {
                console.error('Error fetching email campaign data:', err);
                setError('Failed to load email campaign data. Please try again later.');
            } finally {
                setLoading(false);
            }
        };
        
        fetchCampaignData();
    }, []);
    
    const handleCreateCampaign = () => {
        navigate('/admin/marketing/email-campaigns/new');
    };
    
    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <CircularProgress />
            </Box>
        );
    }
    
    if (error) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error">{error}</Alert>
            </Box>
        );
    }
    
    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Email Campaigns</Typography>
                
                <Button 
                    variant="contained" 
                    color="primary" 
                    startIcon={<AddIcon />}
                    onClick={handleCreateCampaign}
                >
                    Create Campaign
                </Button>
            </Box>
            
            <Paper sx={{ p: 3, mb: 4 }}>
                <EmailCampaignStats campaignData={campaignData} />
            </Paper>
            
            {/* Additional campaign management controls could go here */}
        </Box>
    );
};

export default EmailCampaigns;
