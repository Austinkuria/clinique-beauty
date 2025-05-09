import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/clerk-react';

// Create the context
const AdminContext = createContext();

// Provider component
export const AdminProvider = ({ children }) => {
  // Always define all state hooks, regardless of conditions
  const { user, isSignedIn, isLoaded } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Use a callback for consistency in hook ordering
  const checkAdminStatus = useCallback(() => {
    if (!user || !isLoaded) {
      return false;
    }
    
    // Check all possible locations where admin role might be stored
    const hasAdminRole = 
      (user.unsafeMetadata?.role === 'admin') ||
      (user.privateMetadata?.role === 'admin') ||
      (user.publicMetadata?.role === 'admin') ||
      (user.organizations?.length > 0 && user.organizations[0].publicMetadata?.memberRole === 'admin') ||
      (localStorage.getItem('userIsAdmin') === 'true');
      
    console.log("Admin status check result:", hasAdminRole);
    return hasAdminRole;
  }, [user, isLoaded]);
  
  // Effect to update admin status when user changes
  useEffect(() => {
    const updateAdminStatus = () => {
      setLoading(true);
      
      if (!isLoaded) {
        setLoading(true);
        return;
      }
      
      if (!isSignedIn || !user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }
      
      // Check if the user has admin role in any of the metadata locations
      const adminStatus = checkAdminStatus();
      setIsAdmin(adminStatus);
      setLoading(false);
    };

    updateAdminStatus();
  }, [user, isSignedIn, isLoaded, checkAdminStatus]);
  
  // Value object - create it outside of conditional blocks
  const contextValue = {
    isAdmin,
    loading,
    checkAdminStatus
  };
  
  return (
    <AdminContext.Provider value={contextValue}>
      {children}
    </AdminContext.Provider>
  );
};

// Custom hook to use the admin context
export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

export default AdminContext;
