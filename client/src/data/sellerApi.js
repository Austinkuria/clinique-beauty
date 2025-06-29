import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';
import { useCallback } from 'react';

// Define API base URLs
const SUPABASE_API_URL = 'https://zdbfjwienzjdjpawcnuc.supabase.co/functions/v1/api';
const EXPRESS_API_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:5000/api'  // Development - Express server
  : 'http://localhost:5000/api'; // Production - you'll need to update this with your production Express server URL

// Helper to get auth token from Clerk (for use outside of React components)
const getAuthHeader = async () => {
  // Try to get token from the current Clerk session if available
  try {
    // This is a fallback - ideally we should pass the token from the component
    const clerk = window.Clerk;
    if (clerk && clerk.session) {
      const token = await clerk.session.getToken();
      return token ? { Authorization: `Bearer ${token}` } : {};
    }
  } catch (error) {
    console.warn('Could not get Clerk token:', error);
  }
  return {};
};

export const sellerApi = {
  // Get all sellers with optional filters - Use Supabase Functions for admin operations
  getSellers: async (filters = {}) => {
    try {
      // Build query string for filters
      const queryParams = new URLSearchParams();
      if (filters.status && filters.status !== 'all') {
        queryParams.append('status', filters.status);
      }
      if (filters.search) {
        queryParams.append('search', filters.search);
      }
      
      // Get auth headers for authenticated requests
      const headers = await getAuthHeader();
      
      console.log('Fetching sellers from Supabase Functions API');
      console.log('API URL:', `${SUPABASE_API_URL}/sellers${queryParams.toString() ? '?' + queryParams.toString() : ''}`);
      
      const response = await axios.get(
        `${SUPABASE_API_URL}/sellers${queryParams.toString() ? '?' + queryParams.toString() : ''}`,
        { headers }
      );
      
      return response.data || []; // Return the data array from the response
    } catch (error) {
      console.error('Error fetching sellers:', error);
      // Add more detailed error logging
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
      }
      
      // Return empty array instead of falling back to mock data
      return [];
    }
  },

  // Get seller by ID - Use Supabase Functions
  getSellerById: async (id) => {
    try {
      // Get auth headers for authenticated requests
      const headers = await getAuthHeader();
      
      const response = await axios.get(`${SUPABASE_API_URL}/sellers/${id}`, { headers });
      return response.data;
    } catch (error) {
      console.error(`Error fetching seller ${id}:`, error);
      // Return null instead of mock data
      return null;
    }
  },

  // Update seller verification status - Use Supabase Functions
  updateVerificationStatus: async (id, status, notes = '') => {
    try {
      // Get auth headers for authenticated requests (token required)
      const headers = await getAuthHeader();
      if (!headers.Authorization) {
        console.error('No authorization token found. This operation requires authentication.');
        throw new Error('Authentication required for this operation');
      }
      
      console.log(`Updating seller ${id} to status: ${status}${notes ? ' with notes' : ''}`);
      console.log('Using authorization headers:', headers.Authorization ? 'Bearer token present' : 'No bearer token');
      
      const response = await axios.patch(
        `${SUPABASE_API_URL}/sellers/${id}/verification`, 
        { status, notes },
        { headers }
      );
      
      console.log('Server response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating verification status:', error);
      
      // Enhanced error logging
      if (error.response) {
        console.error('Server error details:', error.response.data);
        console.error('Status code:', error.response.status);
        
        // If the server returns a specific error message, use it
        if (error.response.data && error.response.data.message) {
          throw new Error(error.response.data.message);
        }
      }
      
      throw error;
    }
  },

  // Get verification requests - Use Supabase Functions
  getVerificationRequests: async () => {
    try {
      // Get auth headers for authenticated requests (token required)
      const headers = await getAuthHeader();
      if (!headers.Authorization) {
        throw new Error('Authentication required for this operation');
      }
      
      console.log('Fetching verification requests from Supabase Functions API');
      const response = await axios.get(`${SUPABASE_API_URL}/verification/pending`, { headers });
      return response.data || []; // Return the data array from the response
    } catch (error) {
      console.error('Error fetching verification requests:', error);
      // Return empty array instead of falling back to mock data
      return [];
    }
  }
};

// Hook version for use within React components
export const useSellerApi = () => {
  const { getToken } = useAuth();
  
  const getSellers = useCallback(async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.status && filters.status !== 'all') {
        queryParams.append('status', filters.status);
      }
      if (filters.search) {
        queryParams.append('search', filters.search);
      }
      
      const token = await getToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      console.log('Fetching sellers from Supabase Functions API (hook version)');
      
      const response = await axios.get(
        `${SUPABASE_API_URL}/sellers${queryParams.toString() ? '?' + queryParams.toString() : ''}`,
        { headers }
      );
      
      return response.data || [];
    } catch (error) {
      console.error('Error fetching sellers:', error);
      return [];
    }
  }, [getToken]);
  
  const getVerificationRequests = useCallback(async () => {
    try {
      const token = await getToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await axios.get(`${SUPABASE_API_URL}/verification/pending`, { headers });
      return response.data || [];
    } catch (error) {
      console.error('Error fetching verification requests:', error);
      return [];
    }
  }, [getToken]);
  
  const updateVerificationStatus = useCallback(async (id, status, notes = '') => {
    try {
      const token = await getToken();
      if (!token) {
        throw new Error('Authentication required for this operation');
      }
      
      const headers = { Authorization: `Bearer ${token}` };
      
      const response = await axios.patch(
        `${SUPABASE_API_URL}/sellers/${id}/verification`, 
        { status, notes },
        { headers }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error updating verification status:', error);
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  }, [getToken]);

  return {
    getSellers,
    getVerificationRequests,
    updateVerificationStatus
  };
};
