import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAdmin } from '../context/AdminContext';
import AdminDashboard from '../features/admin/pages/Dashboard';
import AdminProducts from '../features/admin/pages/Products';
import AdminOrders from '../features/admin/pages/Orders';
import AdminUsers from '../features/admin/pages/Users';
import AdminSettings from '../features/admin/pages/Settings';
import AdminLayout from '../features/admin/components/AdminLayout';
import AdminSetup from '../features/admin/pages/AdminSetup';
import NotFound from '../pages/NotFound';

// AdminGuard component to protect admin routes
const AdminGuard = ({ children }) => {
  const { isAdmin, loading } = useAdmin();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !isAdmin) {
      console.log("Access denied: User is not an admin");
      toast.error('Access denied. Admin privileges required.');
      navigate('/admin/setup', { replace: true });
    }
  }, [isAdmin, loading, navigate, location]);

  // Show loading while checking admin status
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div>Checking admin access...</div>
      </div>
    );
  }

  // Only render children if user is admin
  return isAdmin ? children : null;
};

const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="setup" element={<AdminSetup />} />
      
      <Route
        path="/"
        element={
          <AdminGuard>
            <AdminLayout />
          </AdminGuard>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="*" element={<NotFound />} />
      </Route>
      
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
};

export default AdminRoutes;
