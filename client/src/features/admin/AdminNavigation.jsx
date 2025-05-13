import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { List, ListItem, ListItemButton, ListItemText, ListItemIcon } from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Inventory as ProductsIcon,
  ShoppingCart as OrdersIcon,
  Group as CustomersIcon,
  Store as SellersIcon,
  Assessment as PerformanceIcon,
  Payments as PayoutsIcon,
  VerifiedUser as ComplianceIcon,
  AttachMoney as CommissionsIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';

const AdminNavigation = () => {
  const location = useLocation();
  
  const navItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
    { path: '/admin/products', label: 'Products', icon: <ProductsIcon /> },
    { path: '/admin/orders', label: 'Orders', icon: <OrdersIcon /> },
    { path: '/admin/customers', label: 'Customers', icon: <CustomersIcon /> },
    { path: '/admin/sellers', label: 'Seller Management', icon: <SellersIcon /> },
    { path: '/admin/seller-performance', label: 'Seller Performance', icon: <PerformanceIcon /> },
    { path: '/admin/payouts', label: 'Payout Processing', icon: <PayoutsIcon /> },
    { path: '/admin/compliance', label: 'Compliance Monitoring', icon: <ComplianceIcon /> },
    { path: '/admin/commissions', label: 'Commission Structure', icon: <CommissionsIcon /> },
    { path: '/admin/settings', label: 'Settings', icon: <SettingsIcon /> }
  ];
  
  return (
    <List className="admin-sidebar">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path || 
                         (item.path !== '/admin/dashboard' && location.pathname.startsWith(item.path));
        
        return (
          <ListItem disablePadding key={item.path}>
            <ListItemButton
              component={Link}
              to={item.path}
              selected={isActive}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: 'primary.light',
                  '&:hover': {
                    backgroundColor: 'primary.light',
                  },
                },
              }}
            >
              <ListItemIcon>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        );
      })}
    </List>
  );
};

export default AdminNavigation;
