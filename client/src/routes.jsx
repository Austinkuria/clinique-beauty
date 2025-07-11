import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { CircularProgress, Box, Typography } from '@mui/material';
import App from './App.jsx';
import Home from './features/home/Home.jsx';
import Cart from './features/cart/Cart.jsx';
import { RequireAuth, RedirectIfAuthenticated } from './middleware.jsx';
import MainLayout from './layouts/MainLayout.jsx';
import { RouteErrorElement } from './components/ErrorBoundary.jsx';
import Skincare from './features/products/pages/Skincare';
import Makeup from './features/products/pages/Makeup';
import Fragrance from './features/products/pages/Fragrance';
import HairProducts from './features/products/pages/HairProducts';
import ProductDetail from './features/products/ProductDetail';
import CheckoutPage from './features/checkout/Checkout.jsx'; 
import CheckoutConfirmation from './features/checkout/CheckoutConfirmation.jsx'; 
import AdminLayout from './features/admin/layout/AdminLayout';
import AdminDashboard from './features/admin/pages/Dashboard';
import AdminProducts from './features/admin/pages/Products';
import AdminOrders from './features/admin/pages/Orders';
import AdminUsers from './features/admin/pages/Users';
import AdminSettings from './features/admin/pages/Settings';
import AdminSetup from './features/admin/pages/AdminSetup';
import AdminInventory from './features/admin/pages/Inventory';
import Suppliers from './features/admin/pages/Suppliers';
import AdminGuard from './components/AdminGuard';
import SellerGuard from './components/SellerGuard';
import SellerLayout from './features/seller/layout/SellerLayout';
import SellerDashboard from './features/seller/pages/Dashboard';
import SellerProducts from './features/seller/pages/Products';
import SellerOrders from './features/seller/pages/Orders';
import SellerFinancials from './features/seller/pages/Financials';
import RevenueAnalytics from './features/admin/pages/analytics/RevenueAnalytics';
import ProductAnalytics from './features/admin/pages/analytics/ProductAnalytics';
import CustomerAnalytics from './features/admin/pages/analytics/CustomerAnalytics';
import GeographicalAnalytics from './features/admin/pages/analytics/GeographicalAnalytics';
import StockAlertsReport from './features/admin/pages/analytics/StockAlertsReport';
import InventoryForecast from './features/admin/pages/analytics/InventoryForecast';
import SellerManagement from './features/admin/sellers/SellerManagement';
import SellerDetail from './features/admin/sellers/SellerDetail';
import SellerEdit from './features/admin/sellers/SellerEdit';
import CommissionManagement from './features/admin/commission/CommissionManagement';
import SellerPerformance from './features/admin/sellers/SellerPerformance';
import PayoutProcessing from './features/admin/payouts/PayoutProcessing';
import ComplianceMonitoring from './features/admin/compliance/ComplianceMonitoring';
import MarketingLayout from './features/admin/marketing/MarketingLayout';
import MarketingDashboard from './features/admin/marketing/MarketingDashboard';
import CampaignList from './features/admin/marketing/CampaignList';
import DiscountCodes from './features/admin/marketing/DiscountCodes';
import CampaignDetail from './features/admin/marketing/CampaignDetail';
import EmailCampaigns from './features/admin/marketing/EmailCampaigns';
import ABTestingTool from './features/admin/marketing/ABTestingTool';

// Lazy-load these components for better performance
const Login = React.lazy(() => import('./features/auth/Login.jsx'));
const Register = React.lazy(() => import('./features/auth/Register.jsx'));
const ClerkVerification = React.lazy(() => import('./features/auth/ClerkVerification.jsx'));
const SellerApply = React.lazy(() => import('./features/seller/pages/Apply.jsx'));
const SellerStatus = React.lazy(() => import('./features/seller/pages/Status.jsx'));

// Export the router instance directly
export const router = createBrowserRouter([
    {
        path: '/',
        element: <App />,
        errorElement: <RouteErrorElement />,
        children: [
            // Auth routes
            {
                path: '/auth/login',
                element: <RedirectIfAuthenticated><Login /></RedirectIfAuthenticated>,
            },
            {
                path: '/auth/login/factor-one',
                element: <ClerkVerification type="factorOne" />,
            },
            {
                path: '/auth/login/factor-two',
                element: <ClerkVerification type="factorTwo" />
            },
            {
                path: '/auth/login/sso-callback',
                element: <ClerkVerification type="ssoCallback" />,
            },
            {
                path: '/auth/register/*',
                element: <RedirectIfAuthenticated><Register /></RedirectIfAuthenticated>
            },
            { 
                path: '/auth/reset-password', 
                element: <ClerkVerification type="resetPassword" /> 
            },
            { 
                path: '/auth/register/verify-email-address', 
                element: <ClerkVerification type="verifyEmail" /> 
            },
            { 
                path: '/auth/verify', 
                element: <ClerkVerification type="verify" /> 
            },

            // Main layout route - renders Navbar/Footer + Outlet for its children
            {
                path: '/', // Matches the root and subsequent paths
                element: <MainLayout />,
                errorElement: <RouteErrorElement />,
                children: [
                    // Routes rendered within MainLayout's Outlet
                    { index: true, element: <Home /> }, // Use index route for home
                    { path: '/cart', element: <RequireAuth><Cart /></RequireAuth> },
                    { path: '/products/skincare', element: <Skincare /> },
                    { path: '/products/makeup', element: <Makeup /> },
                    { path: '/products/fragrance', element: <Fragrance /> },
                    { path: '/products/hair', element: <HairProducts /> },
                    // Correct path for product detail
                    { path: '/product/:id', element: <ProductDetail /> },                    // Checkout routes
                    { path: '/checkout', element: <RequireAuth><CheckoutPage /></RequireAuth> },
                    { path: '/checkout/confirmation', element: <RequireAuth><CheckoutConfirmation /></RequireAuth> },
                    // Seller application routes (public)
                    { path: '/seller/apply', element: <SellerApply /> },
                    { path: '/seller/status', element: <RequireAuth><SellerStatus /></RequireAuth> },
                ]
            },
            // Admin Setup Route (protected but doesn't require admin role)
            {
                path: '/admin-setup',
                element: <RequireAuth><AdminSetup /></RequireAuth>,
            },
            // Admin Routes with AdminGuard
            {
                path: '/admin',
                element: <AdminGuard><AdminLayout /></AdminGuard>,
                children: [
                    { index: true, element: <AdminDashboard /> },
                    { path: 'products', element: <AdminProducts /> },
                    { path: 'orders', element: <AdminOrders /> },
                    { path: 'users', element: <AdminUsers /> },
                    { path: 'settings', element: <AdminSettings /> },
                    { path: 'inventory', element: <AdminInventory />},
                    { path: 'suppliers', element: <Suppliers />},
                    { path: 'sellers', element: <SellerManagement /> },
                    { path: 'sellers/:sellerId', element: <SellerDetail /> },
                    { path: 'sellers/:sellerId/edit', element: <SellerEdit /> },
                    { path: 'seller-performance', element: <SellerPerformance /> },
                    { path: 'payouts', element: <PayoutProcessing /> },
                    { path: 'compliance', element: <ComplianceMonitoring /> },
                    { path: 'commissions', element: <CommissionManagement /> },
                    // Analytics Routes
                    { path: 'analytics/revenue', element: <RevenueAnalytics /> },
                    { path: 'analytics/products', element: <ProductAnalytics /> },
                    { path: 'analytics/customers', element: <CustomerAnalytics /> },
                    { path: 'analytics/geographical', element: <GeographicalAnalytics /> },
                    { path: 'analytics/stock-alerts', element: <StockAlertsReport /> },
                    { path: 'analytics/inventory-forecast', element: <InventoryForecast /> },
                    {
                        path: 'marketing',
                        element: <MarketingLayout />,
                        children: [
                            { index: true, element: <MarketingDashboard /> },
                            { path: 'campaigns', element: <CampaignList /> }, // Admin campaigns management
                            { path: 'campaigns/new', element: <CampaignDetail /> },
                            { path: 'campaigns/:id', element: <CampaignDetail /> },
                            { path: 'campaigns/edit/:id', element: <CampaignDetail /> }, // Add specific route for editing campaigns
                            { path: 'discounts', element: <DiscountCodes /> },
                            { path: 'email-campaigns', element: <EmailCampaigns /> },                            { path: 'ab-testing', element: <ABTestingTool /> } // Add A/B Testing route
                        ]
                    }
                ]
            },
            // Seller Routes with SellerGuard
            {
                path: '/seller',
                element: <SellerGuard><SellerLayout /></SellerGuard>,
                children: [
                    { index: true, element: <SellerDashboard /> },
                    { path: 'products', element: <SellerProducts /> },
                    { path: 'orders', element: <SellerOrders /> },
                    { path: 'financials', element: <SellerFinancials /> },
                    // TODO: Add remaining seller routes as components are created
                    // { path: 'analytics', element: <SellerAnalytics /> },
                    // { path: 'marketing', element: <SellerMarketing /> },
                    // { path: 'customers', element: <SellerCustomers /> },
                    // { path: 'reports', element: <SellerReports /> },
                    // { path: 'settings', element: <SellerSettings /> },
                    // { path: 'products/new', element: <SellerProductCreate /> },
                    // { path: 'products/:id', element: <SellerProductDetail /> },
                    // { path: 'products/:id/edit', element: <SellerProductEdit /> },
                ]
            },
        ]
    }
]);
