import React from 'react';
import { Box, Paper, Tabs, Tab } from '@mui/material';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Dashboard as DashboardIcon,
  Campaign as CampaignIcon,
  LocalOffer as DiscountIcon
} from '@mui/icons-material';

const MarketingLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const getTabValue = () => {
    if (location.pathname.includes('/admin/marketing/campaigns')) return 1;
    if (location.pathname.includes('/admin/marketing/discounts')) return 2;
    return 0; // Dashboard is the default
  };

  const handleTabChange = (event, newValue) => {
    switch (newValue) {
      case 0:
        navigate('/admin/marketing');
        break;
      case 1:
        navigate('/admin/marketing/campaigns');
        break;
      case 2:
        navigate('/admin/marketing/discounts');
        break;
      default:
        navigate('/admin/marketing');
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={getTabValue()}
          onChange={handleTabChange}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab icon={<DashboardIcon />} label="Dashboard" iconPosition="start" />
          <Tab icon={<CampaignIcon />} label="Campaigns" iconPosition="start" />
          <Tab icon={<DiscountIcon />} label="Discount Codes" iconPosition="start" />
        </Tabs>
      </Paper>
      
      {/* Render child routes */}
      <Outlet />
    </Box>
  );
};

export default MarketingLayout;
