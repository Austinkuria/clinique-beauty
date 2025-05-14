import axios from 'axios';

// Define API base URL without using process.env
const API_BASE_URL = 
  window.location.hostname === 'localhost' 
    ? 'https://zdbfjwienzjdjpawcnuc.supabase.co/functions/v1/api'  // Development URL using Supabase
    : 'https://zdbfjwienzjdjpawcnuc.supabase.co/functions/v1/api'; // Production URL - using Supabase endpoint

// Helper to get auth token from Clerk
const getAuthHeader = () => {
  const token = window.localStorage.getItem('clerk-db-jwt');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const sellerApi = {
  // Get all sellers with optional filters
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
      const headers = getAuthHeader();
      
      console.log('Fetching sellers from Supabase API');
      console.log('API URL:', `${API_BASE_URL}/sellers${queryParams.toString() ? '?' + queryParams.toString() : ''}`);
      
      const response = await axios.get(
        `${API_BASE_URL}/sellers${queryParams.toString() ? '?' + queryParams.toString() : ''}`,
        { headers }
      );
      
      return response.data;
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

  // Get seller by ID
  getSellerById: async (id) => {
    try {
      // Get auth headers for authenticated requests
      const headers = getAuthHeader();
      
      const response = await axios.get(`${API_BASE_URL}/sellers/${id}`, { headers });
      return response.data;
    } catch (error) {
      console.error(`Error fetching seller ${id}:`, error);
      // Return null instead of mock data
      return null;
    }
  },

  // Update seller verification status
  updateVerificationStatus: async (id, status, notes = '') => {
    try {
      // Get auth headers for authenticated requests (token required)
      const headers = getAuthHeader();
      if (!headers.Authorization) {
        console.error('No authorization token found. This operation requires authentication.');
        throw new Error('Authentication required for this operation');
      }
      
      console.log(`Updating seller ${id} to status: ${status}${notes ? ' with notes' : ''}`);
      console.log('Using authorization headers:', headers.Authorization ? 'Bearer token present' : 'No bearer token');
      
      const response = await axios.patch(
        `${API_BASE_URL}/sellers/${id}/verification`, 
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

  // Get verification requests
  getVerificationRequests: async () => {
    try {
      // Get auth headers for authenticated requests (token required)
      const headers = getAuthHeader();
      if (!headers.Authorization) {
        throw new Error('Authentication required for this operation');
      }
      
      const response = await axios.get(`${API_BASE_URL}/verification/pending`, { headers });
      return response.data;
    } catch (error) {
      console.error('Error fetching verification requests:', error);
      // Return empty array instead of falling back to mock data
      return [];
    }
  }
};
