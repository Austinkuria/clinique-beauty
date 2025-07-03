import axios from 'axios';
import { getApiUrl } from '../config/env';

// Get the API URL once when the module is first loaded
const API_BASE_URL = getApiUrl();

export const marketingApi = {
  // Campaign Management
  getCampaigns: async (filters = {}) => {
    try {
      // For development, using mock data
      // In production, uncomment: const response = await axios.get(`${API_BASE_URL}/marketing/campaigns`, { params: filters });
      
      // Mock data for development
      return {
        data: [
          {
            id: 'camp-001',
            name: 'Summer Sale 2025',
            description: 'Special discounts on summer products',
            startDate: '2025-06-01',
            endDate: '2025-08-31',
            status: 'active',
            type: 'seasonal',
            target: 'all_customers',
            discountType: 'percentage',
            discountValue: 15,
            bannerImage: 'summer_banner.jpg',
            stats: {
              views: 12500,
              clicks: 4800,
              conversions: 870,
              revenue: 28500
            }
          },
          {
            id: 'camp-002',
            name: 'New Customer Welcome',
            description: 'Special offer for first-time customers',
            startDate: '2025-01-01',
            endDate: '2025-12-31',
            status: 'active',
            type: 'welcome',
            target: 'new_customers',
            discountType: 'fixed',
            discountValue: 10,
            bannerImage: 'welcome_banner.jpg',
            stats: {
              views: 8900,
              clicks: 3200,
              conversions: 950,
              revenue: 19800
            }
          },
          {
            id: 'camp-003',
            name: 'Holiday Collection 2025',
            description: 'Special holiday-themed products and bundles',
            startDate: '2025-11-15',
            endDate: '2025-12-25',
            status: 'scheduled',
            type: 'seasonal',
            target: 'all_customers',
            discountType: 'percentage',
            discountValue: 20,
            bannerImage: 'holiday_banner.jpg',
            stats: {
              views: 0,
              clicks: 0,
              conversions: 0,
              revenue: 0
            }
          },
          {
            id: 'camp-004',
            name: 'Spring Sale 2025',
            description: 'Spring collection promotion',
            startDate: '2025-03-01',
            endDate: '2025-05-31',
            status: 'ended',
            type: 'seasonal',
            target: 'all_customers',
            discountType: 'percentage',
            discountValue: 15,
            bannerImage: 'spring_banner.jpg',
            stats: {
              views: 14200,
              clicks: 5100,
              conversions: 920,
              revenue: 32400
            }
          }
        ],
        total: 4
      };
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      throw error;
    }
  },

  getCampaignById: async (id) => {
    try {
      // For production: const response = await axios.get(`${API_BASE_URL}/marketing/campaigns/${id}`);
      
      // Mock for development
      return {
        data: {
          id: id,
          name: 'Summer Sale 2025',
          description: 'Special discounts on summer products',
          startDate: '2025-06-01',
          endDate: '2025-08-31',
          status: 'active',
          type: 'seasonal',
          target: 'all_customers',
          discountType: 'percentage',
          discountValue: 15,
          bannerImage: 'summer_banner.jpg',
          stats: {
            views: 12500,
            clicks: 4800,
            conversions: 870,
            revenue: 28500
          },
          products: [
            { id: 'prod-123', name: 'Summer Hydration Cream', included: true },
            { id: 'prod-124', name: 'UV Protection Lotion', included: true },
            { id: 'prod-125', name: 'After-Sun Repair Mask', included: true }
          ]
        }
      };
    } catch (error) {
      console.error(`Error fetching campaign ${id}:`, error);
      throw error;
    }
  },

  createCampaign: async (campaignData) => {
    try {
      // For production: const response = await axios.post(`${API_BASE_URL}/marketing/campaigns`, campaignData);
      
      // Mock for development
      return {
        success: true,
        data: {
          id: 'camp-' + Math.floor(Math.random() * 1000),
          ...campaignData,
          status: 'scheduled',
          createdAt: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Error creating campaign:', error);
      throw error;
    }
  },

  updateCampaign: async (id, campaignData) => {
    try {
      // For production: const response = await axios.put(`${API_BASE_URL}/marketing/campaigns/${id}`, campaignData);
      
      // Mock for development
      return {
        success: true,
        data: {
          id,
          ...campaignData,
          updatedAt: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error(`Error updating campaign ${id}:`, error);
      throw error;
    }
  },

  deleteCampaign: async (id) => {
    try {
      // For production: const response = await axios.delete(`${API_BASE_URL}/marketing/campaigns/${id}`);
      
      // Mock for development
      return {
        success: true,
        message: `Campaign ${id} has been deleted`
      };
    } catch (error) {
      console.error(`Error deleting campaign ${id}:`, error);
      throw error;
    }
  },

  // Discount Codes
  getDiscountCodes: async (filters = {}) => {
    try {
      // For production: const response = await axios.get(`${API_BASE_URL}/marketing/discount-codes`, { params: filters });
      
      // Mock data for development
      return {
        data: [
          {
            id: 'disc-001',
            code: 'SUMMER15',
            description: 'Summer sale discount',
            discountType: 'percentage',
            discountValue: 15,
            startDate: '2025-06-01',
            endDate: '2025-08-31',
            status: 'active',
            usageLimit: 1000,
            usageCount: 423,
            minimumOrderValue: 50,
            campaigns: ['Summer Sale 2025']
          },
          {
            id: 'disc-002',
            code: 'WELCOME10',
            description: 'New customer discount',
            discountType: 'fixed',
            discountValue: 10,
            startDate: '2025-01-01',
            endDate: '2025-12-31',
            status: 'active',
            usageLimit: 5000,
            usageCount: 1875,
            minimumOrderValue: 25,
            campaigns: ['New Customer Welcome']
          },
          {
            id: 'disc-003',
            code: 'HOLIDAY20',
            description: 'Holiday season discount',
            discountType: 'percentage',
            discountValue: 20,
            startDate: '2025-11-15',
            endDate: '2025-12-25',
            status: 'scheduled',
            usageLimit: 2000,
            usageCount: 0,
            minimumOrderValue: 75,
            campaigns: ['Holiday Collection 2025']
          },
          {
            id: 'disc-004',
            code: 'SPRING15',
            description: 'Spring season discount',
            discountType: 'percentage',
            discountValue: 15,
            startDate: '2025-03-01',
            endDate: '2025-05-31',
            status: 'expired',
            usageLimit: 1500,
            usageCount: 1287,
            minimumOrderValue: 50,
            campaigns: ['Spring Sale 2025']
          }
        ],
        total: 4
      };
    } catch (error) {
      console.error('Error fetching discount codes:', error);
      throw error;
    }
  },

  getDiscountCodeById: async (id) => {
    try {
      // For production: const response = await axios.get(`${API_BASE_URL}/marketing/discount-codes/${id}`);
      
      // Mock for development
      return {
        data: {
          id,
          code: 'SUMMER15',
          description: 'Summer sale discount',
          discountType: 'percentage',
          discountValue: 15,
          startDate: '2025-06-01',
          endDate: '2025-08-31',
          status: 'active',
          usageLimit: 1000,
          usageCount: 423,
          minimumOrderValue: 50,
          campaigns: ['Summer Sale 2025'],
          applicable: {
            productCategories: ['skincare', 'suncare'],
            specificProducts: [
              { id: 'prod-123', name: 'Summer Hydration Cream' },
              { id: 'prod-124', name: 'UV Protection Lotion' }
            ],
            customerGroups: ['regular', 'vip']
          },
          usageHistory: [
            { date: '2025-06-05', orderId: 'ord-5678', amount: 75.99, discount: 11.40 },
            { date: '2025-06-06', orderId: 'ord-5679', amount: 120.50, discount: 18.08 }
          ]
        }
      };
    } catch (error) {
      console.error(`Error fetching discount code ${id}:`, error);
      throw error;
    }
  },

  createDiscountCode: async (codeData) => {
    try {
      // For production: const response = await axios.post(`${API_BASE_URL}/marketing/discount-codes`, codeData);
      
      // Mock for development
      return {
        success: true,
        data: {
          id: 'disc-' + Math.floor(Math.random() * 1000),
          ...codeData,
          usageCount: 0,
          status: codeData.startDate <= new Date().toISOString().split('T')[0] ? 'active' : 'scheduled',
          createdAt: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Error creating discount code:', error);
      throw error;
    }
  },

  updateDiscountCode: async (id, codeData) => {
    try {
      // For production: const response = await axios.put(`${API_BASE_URL}/marketing/discount-codes/${id}`, codeData);
      
      // Mock for development
      return {
        success: true,
        data: {
          id,
          ...codeData,
          updatedAt: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error(`Error updating discount code ${id}:`, error);
      throw error;
    }
  },

  deleteDiscountCode: async (id) => {
    try {
      // For production: const response = await axios.delete(`${API_BASE_URL}/marketing/discount-codes/${id}`);
      
      // Mock for development
      return {
        success: true,
        message: `Discount code ${id} has been deleted`
      };
    } catch (error) {
      console.error(`Error deleting discount code ${id}:`, error);
      throw error;
    }
  },

  // Analytics for marketing campaigns and discount codes
  getMarketingAnalytics: async (period = 'month') => {
    try {
      // For production: const response = await axios.get(`${API_BASE_URL}/marketing/analytics`, { params: { period } });
      
      // Mock for development
      return {
        data: {
          campaigns: {
            active: 2,
            scheduled: 1,
            ended: 1,
            totalRevenue: 80700,
            totalConversions: 2740,
            conversionRate: 14.8,
            topPerforming: 'Spring Sale 2025'
          },
          discountCodes: {
            active: 2,
            scheduled: 1,
            expired: 1,
            totalUsage: 3585,
            averageDiscount: 15.75,
            revenueGenerated: 95200,
            mostUsed: 'WELCOME10'
          },
          monthly: [
            { month: 'Jan', revenue: 12000, campaigns: 2, conversions: 350 },
            { month: 'Feb', revenue: 14500, campaigns: 2, conversions: 410 },
            { month: 'Mar', revenue: 16800, campaigns: 3, conversions: 490 },
            { month: 'Apr', revenue: 18200, campaigns: 3, conversions: 520 },
            { month: 'May', revenue: 16900, campaigns: 3, conversions: 480 },
            { month: 'Jun', revenue: 19500, campaigns: 2, conversions: 550 },
            { month: 'Jul', revenue: 21000, campaigns: 2, conversions: 590 }
          ]
        }
      };
    } catch (error) {
      console.error('Error fetching marketing analytics:', error);
      throw error;
    }
  }
};

export default marketingApi;
