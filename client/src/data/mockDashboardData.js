/**
 * Centralized mock data for the admin dashboard
 * This file can be used both by the client and server for consistent data structure
 */

// Helper function to generate daily data with realistic variance
export const generateDailyData = () => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const baseRevenue = 1500;
  return days.map(day => {
    // Add some randomness for more realistic data
    const variance = Math.floor(Math.random() * 800) - 400; // Random value between -400 and 400
    const revenue = Math.max(baseRevenue + variance, 800); // Ensure minimum revenue of 800
    const transactions = Math.floor(Math.random() * 50) + 30; // 30-80 transactions per day
    return { 
      day,
      revenue,
      transactions,
      avgOrderValue: +(revenue / transactions).toFixed(2)
    };
  });
};

// Helper function to generate weekly data with trend
export const generateWeeklyData = () => {
  const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
  let baseRevenue = 8000;
  return weeks.map(week => {
    // Gradually increase revenue with some variance
    const variance = Math.floor(Math.random() * 1200) - 400;
    const revenue = baseRevenue + variance;
    const transactions = Math.floor(revenue / 75); // Average order value of $75
    baseRevenue += 800; // Upward trend
    return {
      week,
      revenue,
      transactions,
      avgOrderValue: +(revenue / transactions).toFixed(2)
    };
  });
};

// Main mock data object
export const mockDashboardData = {
  stats: {
    revenue: { total: 156789.99, growth: 12.5, currency: 'KSh' },
    orders: { total: 1256, growth: 8.2 },
    users: { total: 3254, growth: 5.1 },
    products: { total: 527, growth: -2.3 },
    fulfillmentRate: { value: 94.7, growth: 3.8 }
  },
  
  // Revenue data by time periods with more detailed metrics
  revenueCharts: {
    daily: generateDailyData(),
    weekly: generateWeeklyData(),
    monthly: [
      { month: 'Jan', revenue: 12000, transactions: 168, avgOrderValue: 71.43, currency: 'KSh' },
      { month: 'Feb', revenue: 15000, transactions: 205, avgOrderValue: 73.17 },
      { month: 'Mar', revenue: 18000, transactions: 243, avgOrderValue: 74.07 },
      { month: 'Apr', revenue: 16000, transactions: 213, avgOrderValue: 75.12 },
      { month: 'May', revenue: 21000, transactions: 275, avgOrderValue: 76.36 },
      { month: 'Jun', revenue: 19000, transactions: 244, avgOrderValue: 77.87 },
      { month: 'Jul', revenue: 22000, transactions: 278, avgOrderValue: 79.14 },
      { month: 'Aug', revenue: 20500, transactions: 256, avgOrderValue: 80.08 },
      { month: 'Sep', revenue: 23000, transactions: 283, avgOrderValue: 81.27 },
      { month: 'Oct', revenue: 21800, transactions: 265, avgOrderValue: 82.26 },
      { month: 'Nov', revenue: 24000, transactions: 290, avgOrderValue: 82.76 },
      { month: 'Dec', revenue: 28000, transactions: 335, avgOrderValue: 83.58 }
    ],
    yearly: [
      { year: '2019', revenue: 120000, growth: null, currency: 'KSh' },
      { year: '2020', revenue: 150000, growth: 25.0 },
      { year: '2021', revenue: 180000, growth: 20.0 },
      { year: '2022', revenue: 210000, growth: 16.7 },
      { year: '2023', revenue: 250000, growth: 19.0 }
    ]
  },
  
  // User growth data with acquisition channels
  userGrowth: [
    { month: 'Jan', users: 2800, newUsers: 120, organic: 72, paid: 48 },
    { month: 'Feb', users: 2900, newUsers: 135, organic: 81, paid: 54 },
    { month: 'Mar', users: 3000, newUsers: 148, organic: 86, paid: 62 },
    { month: 'Apr', users: 3050, newUsers: 102, organic: 63, paid: 39 },
    { month: 'May', users: 3150, newUsers: 156, organic: 92, paid: 64 },
    { month: 'Jun', users: 3200, newUsers: 128, organic: 77, paid: 51 },
    { month: 'Jul', users: 3254, newUsers: 143, organic: 85, paid: 58 }
  ],
  
  // Product category data with profit margins
  categoryData: [
    { name: 'Skincare', value: 400, growth: 15.2, margin: 42 },
    { name: 'Makeup', value: 300, growth: 8.7, margin: 38 },
    { name: 'Fragrance', value: 200, growth: 5.3, margin: 45 },
    { name: 'Hair', value: 100, growth: -2.1, margin: 36 },
    { name: 'Body', value: 85, growth: 3.8, margin: 40 },
    { name: 'Tools', value: 65, growth: 12.5, margin: 48 }
  ],
  
  // Top performing products with added metrics
  topProducts: [
    { id: 1, name: 'Anti-Aging Serum', sales: 253, revenue: 15180, growth: 12.3, avgRating: 4.8, stock: 142 },
    { id: 2, name: 'Facial Moisturizer', sales: 241, revenue: 12050, growth: 8.7, avgRating: 4.7, stock: 215 },
    { id: 3, name: 'Vitamin C Cleanser', sales: 187, revenue: 8415, growth: 15.2, avgRating: 4.9, stock: 93 },
    { id: 4, name: 'Eye Cream', sales: 156, revenue: 7800, growth: 6.8, avgRating: 4.6, stock: 128 },
    { id: 5, name: 'SPF 50 Sunscreen', sales: 142, revenue: 6390, growth: 4.2, avgRating: 4.5, stock: 176 },
    { id: 6, name: 'Hydrating Toner', sales: 138, revenue: 5520, growth: 7.5, avgRating: 4.4, stock: 152 },
    { id: 7, name: 'Lip Treatment', sales: 125, revenue: 3750, growth: 9.8, avgRating: 4.7, stock: 204 }
  ],
  
  // Enhanced geographical sales data with more countries and metrics
  geographicalData: [
    { country: 'USA', sales: 1250, revenue: 87500, growth: 8.5, avgOrderValue: 70 },
    { country: 'Canada', sales: 520, revenue: 36400, growth: 6.2, avgOrderValue: 70 },
    { country: 'UK', sales: 480, revenue: 33600, growth: 7.8, avgOrderValue: 70 },
    { country: 'Kenya', sales: 410, revenue: 28700, growth: 18.5, avgOrderValue: 70 },
    { country: 'Australia', sales: 320, revenue: 22400, growth: 5.4, avgOrderValue: 70 },
    { country: 'Germany', sales: 290, revenue: 20300, growth: 9.2, avgOrderValue: 70 },
    { country: 'Nigeria', sales: 285, revenue: 19950, growth: 16.7, avgOrderValue: 70 },
    { country: 'France', sales: 275, revenue: 19250, growth: 4.7, avgOrderValue: 70 },
    { country: 'Japan', sales: 260, revenue: 18200, growth: 3.9, avgOrderValue: 70 },
    { country: 'South Korea', sales: 230, revenue: 16100, growth: 11.3, avgOrderValue: 70 },
    { country: 'Ghana', sales: 195, revenue: 13650, growth: 14.8, avgOrderValue: 70 },
    { country: 'Brazil', sales: 180, revenue: 12600, growth: 15.8, avgOrderValue: 70 },
    { country: 'Mexico', sales: 175, revenue: 12250, growth: 12.2, avgOrderValue: 70 },
    { country: 'Tanzania', sales: 170, revenue: 11900, growth: 13.6, avgOrderValue: 70 },
    { country: 'Italy', sales: 165, revenue: 11550, growth: 6.8, avgOrderValue: 70 },
    { country: 'Spain', sales: 152, revenue: 10640, growth: 5.3, avgOrderValue: 70 },
    { country: 'Netherlands', sales: 135, revenue: 9450, growth: 7.9, avgOrderValue: 70 },
    { country: 'Uganda', sales: 130, revenue: 9100, growth: 12.5, avgOrderValue: 70 },
    { country: 'Sweden', sales: 128, revenue: 8960, growth: 8.4, avgOrderValue: 70 },
    { country: 'Singapore', sales: 115, revenue: 8050, growth: 9.7, avgOrderValue: 70 },
    { country: 'UAE', sales: 108, revenue: 7560, growth: 13.5, avgOrderValue: 70 },
    { country: 'Rwanda', sales: 105, revenue: 7350, growth: 15.3, avgOrderValue: 70 },
    { country: 'India', sales: 95, revenue: 6650, growth: 17.2, avgOrderValue: 70 },
    { country: 'South Africa', sales: 85, revenue: 5950, growth: 10.8, avgOrderValue: 70 },
    { country: 'Ethiopia', sales: 80, revenue: 5600, growth: 11.5, avgOrderValue: 70 },
    { country: 'New Zealand', sales: 78, revenue: 5460, growth: 6.5, avgOrderValue: 70 },
    { country: 'Argentina', sales: 65, revenue: 4550, growth: 8.9, avgOrderValue: 70 }
  ],
  
  // Order fulfillment data with more detailed metrics
  fulfillmentData: {
    rates: [
      { month: 'Jan', rate: 91.2, onTime: 87.5, returned: 3.2 },
      { month: 'Feb', rate: 92.4, onTime: 88.7, returned: 2.8 },
      { month: 'Mar', rate: 93.1, onTime: 90.2, returned: 2.5 },
      { month: 'Apr', rate: 92.8, onTime: 89.6, returned: 2.7 },
      { month: 'May', rate: 93.7, onTime: 91.3, returned: 2.1 },
      { month: 'Jun', rate: 94.2, onTime: 92.5, returned: 1.9 },
      { month: 'Jul', rate: 94.7, onTime: 93.1, returned: 1.8 }
    ],
    statuses: [
      { status: 'Delivered', count: 892, percentage: 71 },
      { status: 'Shipped', count: 230, percentage: 18.3 },
      { status: 'Processing', count: 104, percentage: 8.3 },
      { status: 'Cancelled', count: 30, percentage: 2.4 }
    ],
    shippingMethods: [
      { method: 'Standard', count: 723, percentage: 57.6 },
      { method: 'Express', count: 352, percentage: 28.0 },
      { method: 'Next Day', count: 181, percentage: 14.4 }
    ]
  },
  
  // Revenue projections with more realistic confidence intervals
  revenueProjections: [
    { month: 'Aug', projected: 24000, actual: 23850, upperBound: 25200, lowerBound: 22800 },
    { month: 'Sep', projected: 25500, actual: null, upperBound: 26700, lowerBound: 24300 },
    { month: 'Oct', projected: 26800, actual: null, upperBound: 28200, lowerBound: 25400 },
    { month: 'Nov', projected: 29000, actual: null, upperBound: 30600, lowerBound: 27500 },
    { month: 'Dec', projected: 32500, actual: null, upperBound: 34500, lowerBound: 30500 },
    { month: 'Jan', projected: 26000, actual: null, upperBound: 27800, lowerBound: 24300 }
  ],
  
  // Recent orders with more details
  recentOrders: [
    { id: 'ORD-1001', customer: 'Wangari Muchiri', total: 89.99, status: 'Completed', date: '2023-09-15', items: 3, paymentMethod: 'M-Pesa', currency: 'KSh' },
    { id: 'ORD-1002', customer: 'John Kamau', total: 124.50, status: 'Processing', date: '2023-09-14', items: 4, paymentMethod: 'M-Pesa', currency: 'KSh' },
    { id: 'ORD-1003', customer: 'Amina Mohamed', total: 76.25, status: 'Shipped', date: '2023-09-14', items: 2, paymentMethod: 'Credit Card', currency: 'KSh' },
    { id: 'ORD-1004', customer: 'Robert Ouko', total: 212.99, status: 'Processing', date: '2023-09-13', items: 6, paymentMethod: 'M-Pesa', currency: 'KSh' },
    { id: 'ORD-1005', customer: 'Jane Cooper', total: 45.00, status: 'Completed', date: '2023-09-12', items: 1, paymentMethod: 'M-Pesa', currency: 'KSh' },
    { id: 'ORD-1006', customer: 'Michael Otieno', total: 156.75, status: 'Shipped', date: '2023-09-12', items: 3, paymentMethod: 'Credit Card', currency: 'KSh' },
    { id: 'ORD-1007', customer: 'Faith Njeri', total: 97.50, status: 'Completed', date: '2023-09-11', items: 2, paymentMethod: 'M-Pesa', currency: 'KSh' },
    { id: 'ORD-1008', customer: 'David Ndegwa', total: 189.25, status: 'Delivered', date: '2023-09-10', items: 5, paymentMethod: 'Credit Card', currency: 'KSh' },
    { id: 'ORD-1009', customer: 'Lucy Wanjiku', total: 112.75, status: 'Completed', date: '2023-09-09', items: 3, paymentMethod: 'M-Pesa', currency: 'KSh' },
    { id: 'ORD-1010', customer: 'Emmanuel Osei', total: 78.50, status: 'Shipped', date: '2023-09-08', items: 2, paymentMethod: 'Mobile Money', currency: 'KSh' }
  ]
};

// For convenience, also export each section separately
export const { 
  stats, 
  revenueCharts, 
  userGrowth, 
  categoryData, 
  topProducts, 
  geographicalData, 
  fulfillmentData, 
  revenueProjections, 
  recentOrders 
} = mockDashboardData;

export default mockDashboardData;
