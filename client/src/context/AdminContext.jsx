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
  
  // Check whether current user is an administrator
  const checkAdminStatus = useCallback(() => {
    if (!user || !isLoaded) {
      return false;
    }
    
    const explicitRole = (
      user.unsafeMetadata?.role || 
      user.publicMetadata?.role || 
      user.privateMetadata?.role || 
      ''
    ).toLowerCase();

    // If account role is explicitly seller or customer, administrator access must be denied
    if (explicitRole && explicitRole !== 'admin') {
      localStorage.removeItem('userIsAdmin');
      return false;
    }

    const hasAdminRole = 
      (explicitRole === 'admin') ||
      (user.organizations?.length > 0 && user.organizations[0].publicMetadata?.memberRole === 'admin') ||
      (user.primaryEmailAddress?.emailAddress === 'admin@clinique.com');
      
    if (!hasAdminRole) {
      localStorage.removeItem('userIsAdmin');
    }

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
