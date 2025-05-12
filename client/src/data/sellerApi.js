import axios from 'axios';

const API_URL = '/api/sellers';

export const sellerApi = {
  // Get all sellers with optional filters
  getSellers: async (filters = {}) => {
    try {
      const response = await axios.get(API_URL, { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching sellers:', error);
      throw error;
    }
  },

  // Get seller by ID
  getSellerById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching seller ${id}:`, error);
      throw error;
    }
  },

  // Update seller verification status
  updateVerificationStatus: async (id, status, notes = '') => {
    try {
      const response = await axios.patch(`${API_URL}/${id}/verification`, {
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
      const response = await axios.get(`${API_URL}/verification/pending`);
      return response.data;
    } catch (error) {
      console.error('Error fetching verification requests:', error);
      throw error;
    }
  }
};
