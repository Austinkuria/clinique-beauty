import axios from 'axios';
import { mockSellers, getPendingVerificationRequests } from './mockSellersData';

// Define API base URL without using process.env
const API_BASE_URL = 
  window.location.hostname === 'localhost' 
    ? 'https://zdbfjwienzjdjpawcnuc.supabase.co/functions/v1/api'  // Development URL updated to use Supabase
    : 'https://zdbfjwienzjdjpawcnuc.supabase.co/functions/v1/api'; // Production URL - using Supabase endpoint

// Change to false to use the real API
const USE_MOCK_DATA = false;

// Helper to get auth token from Clerk
const getAuthHeader = () => {
  const token = window.localStorage.getItem('clerk-db-jwt');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const sellerApi = {
  // Get all sellers with optional filters
  getSellers: async (filters = {}) => {
    try {
      if (USE_MOCK_DATA) {
        console.log('Using mock seller data');
        
        // Filter mock data if needed
        let filteredData = [...mockSellers];
        if (filters.status && filters.status !== 'all') {
          filteredData = filteredData.filter(seller => seller.status === filters.status);
        }
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          filteredData = filteredData.filter(seller => 
            seller.businessName.toLowerCase().includes(searchLower) ||
            seller.contactName.toLowerCase().includes(searchLower) ||
            seller.email.toLowerCase().includes(searchLower)
          );
        }
        
        return Promise.resolve(filteredData);
      }
      
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
      console.log('Using headers:', headers);
      
      const response = await axios.get(
        `${API_BASE_URL}/sellers${queryParams.toString() ? '?' + queryParams.toString() : ''}`,
        { headers }
      );
      
      console.log('API Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching sellers:', error);
      // Add more detailed error logging
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
      }
      
      // Fallback to mock data if API request fails
      if (!USE_MOCK_DATA) {
        console.log('Falling back to mock data due to API error');
        return mockSellers;
      }
      throw error;
    }
  },

  // Get seller by ID
  getSellerById: async (id) => {
    try {
      if (USE_MOCK_DATA) {
        const seller = mockSellers.find(s => s.id === id);
        return Promise.resolve(seller || null);
      }
      
      // Get auth headers for authenticated requests
      const headers = getAuthHeader();
      
      const response = await axios.get(`${API_BASE_URL}/sellers/${id}`, { headers });
      return response.data;
    } catch (error) {
      console.error(`Error fetching seller ${id}:`, error);
      // Fallback to mock data if API request fails
      if (!USE_MOCK_DATA) {
        const seller = mockSellers.find(s => s.id === id);
        if (seller) return seller;
      }
      throw error;
    }
  },

  // Update seller verification status
  updateVerificationStatus: async (id, status, notes = '') => {
    try {
      if (USE_MOCK_DATA) {
        // In mock mode, we just simulate the update
        console.log(`Mock: Updated seller ${id} verification status to ${status}`);
        return Promise.resolve({ success: true, id, status });
      }
      
      // Get auth headers for authenticated requests (token required)
      const headers = getAuthHeader();
      if (!headers.Authorization) {
        throw new Error('Authentication required for this operation');
      }
      
      const response = await axios.patch(
        `${API_BASE_URL}/sellers/${id}/verification`, 
        { status, notes },
        { headers }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error updating verification status:', error);
      throw error;
    }
  },

  // Get verification requests
  getVerificationRequests: async () => {
    try {
      if (USE_MOCK_DATA) {
        return Promise.resolve(getPendingVerificationRequests());
      }
      
      // Get auth headers for authenticated requests (token required)
      const headers = getAuthHeader();
      if (!headers.Authorization) {
        throw new Error('Authentication required for this operation');
      }
      
      const response = await axios.get(`${API_BASE_URL}/verification/pending`, { headers });
      return response.data;
    } catch (error) {
      console.error('Error fetching verification requests:', error);
      // Fallback to mock data if API request fails
      if (!USE_MOCK_DATA) {
        return getPendingVerificationRequests();
      }
      throw error;
    }
  }
};
