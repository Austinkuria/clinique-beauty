import React, { createContext, useState, useEffect, useContext } from 'react';
import { useUser } from '@clerk/clerk-react';
import { toast } from 'react-hot-toast';

// Create context
export const AdminContext = createContext({
  isAdmin: false,
  checkAdminStatus: () => {},
  loading: true
});

export const AdminProvider = ({ children }) => {
  const { user, isLoaded } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Function to check admin status from all possible sources
  const checkAdminStatus = () => {
    if (!isLoaded || !user) {
      setLoading(false);
      return false;
    }

    console.log("Checking admin status. User metadata:", {
      publicMetadata: user.publicMetadata,
      unsafeMetadata: user.unsafeMetadata,
      hasOrgs: user.organizations?.length > 0
    });

    // 1. Check Clerk metadata (multiple possible locations)
    const hasAdminRoleInMetadata = 
      (user.unsafeMetadata && user.unsafeMetadata.role === 'admin') || 
      (user.publicMetadata && user.publicMetadata.role === 'admin') ||
      (user.privateMetadata && user.privateMetadata.role === 'admin') ||
      (user.organizations && 
        user.organizations.length > 0 && 
        user.organizations[0].publicMetadata && 
        user.organizations[0].publicMetadata.memberRole === 'admin');
      
    // 2. Check localStorage fallback 
    const hasAdminRoleInLocalStorage = localStorage.getItem('userIsAdmin') === 'true';
      
    // Set admin status based on either source
    const adminStatus = hasAdminRoleInMetadata || hasAdminRoleInLocalStorage;
    console.log(`Admin check result: ${adminStatus} (metadata: ${hasAdminRoleInMetadata}, localStorage: ${hasAdminRoleInLocalStorage})`);
    
    setIsAdmin(adminStatus);
    setLoading(false);
    return adminStatus;
  };

  // Check admin status when user or isLoaded changes
  useEffect(() => {
    checkAdminStatus();
  }, [user, isLoaded]);

  return (
    <AdminContext.Provider value={{ isAdmin, checkAdminStatus, loading }}>
      {children}
    </AdminContext.Provider>
  );
};

// Custom hook to use the admin context
export const useAdmin = () => useContext(AdminContext);

export default AdminProvider;
