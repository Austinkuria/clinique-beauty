import axios from 'axios';

const API_URL = '/api/commissions';

export const commissionApi = {
  // Get current commission structure
  getCommissionStructure: async () => {
    try {
      const response = await axios.get(API_URL);
      return response.data;
    } catch (error) {
      console.error('Error fetching commission structure:', error);
      throw error;
    }
  },

  // Update commission rate for a category
  updateCategoryRate: async (categoryId, rate) => {
    try {
      const response = await axios.patch(`${API_URL}/categories/${categoryId}`, { rate });
      return response.data;
    } catch (error) {
      console.error('Error updating category commission rate:', error);
      throw error;
    }
  },

  // Update tier-based commission structure
  updateCommissionTiers: async (tiers) => {
    try {
      const response = await axios.put(`${API_URL}/tiers`, { tiers });
      return response.data;
    } catch (error) {
      console.error('Error updating commission tiers:', error);
      throw error;
    }
  },

  // Get commission history
  getCommissionHistory: async (filters = {}) => {
    try {
      const response = await axios.get(`${API_URL}/history`, { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching commission history:', error);
      throw error;
    }
  }
};
