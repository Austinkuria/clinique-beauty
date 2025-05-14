import axios from 'axios';
import { mockSellers, getPendingVerificationRequests } from './mockSellersData';

// Define API base URL without using process.env
const API_BASE_URL = 
  window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api'  // Development URL
    : 'https://api.clinique-beauty.com/api'; // Production URL - change to your actual domain

// Use a flag to control whether to use mock data or real API
const USE_MOCK_DATA = true; // Set to false when your backend is ready

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
      
      const response = await axios.get(`${API_BASE_URL}/sellers`, { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching sellers:', error);
      throw error;
    }
  },

  // Get seller by ID
  getSellerById: async (id) => {
    try {
      if (USE_MOCK_DATA) {
        const seller = mockSellers.find(s => s.id === parseInt(id));
        return Promise.resolve(seller || null);
      }
      
      const response = await axios.get(`${API_BASE_URL}/sellers/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching seller ${id}:`, error);
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
      
      const response = await axios.patch(`${API_BASE_URL}/sellers/${id}/verification`, {
        status,
        notes
      });
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
      
      const response = await axios.get(`${API_BASE_URL}/verification/pending`);
      return response.data;
    } catch (error) {
      console.error('Error fetching verification requests:', error);
      throw error;
    }
  }
};
