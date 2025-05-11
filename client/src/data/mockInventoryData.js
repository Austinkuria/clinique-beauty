/**
 * Mock inventory data for development and testing
 */

// Stock movement types
export const STOCK_MOVEMENT_TYPES = {
  PURCHASE: 'purchase',
  SALE: 'sale',
  ADJUSTMENT: 'adjustment',
  RETURN: 'return',
  DAMAGED: 'damaged',
  TRANSFER: 'transfer'
};

// Stock movement data for history tracking
export const stockMovements = [
  {
    id: 'SM-1001',
    date: '2023-09-25',
    productId: 1,
    productName: 'Moisturizing Cream',
    type: STOCK_MOVEMENT_TYPES.PURCHASE,
    quantity: 50,
    notes: 'Restocked from supplier Kenya Cosmetics Ltd.',
    user: 'David Mutua'
  },
  {
    id: 'SM-1002',
    date: '2023-09-25',
    productId: 3,
    productName: 'Citrus Perfume',
    type: STOCK_MOVEMENT_TYPES.PURCHASE,
    quantity: 30,
    notes: 'Monthly restock from Nairobi Fragrances',
    user: 'David Mutua'
  },
  {
    id: 'SM-1003',
    date: '2023-09-26',
    productId: 4,
    productName: 'Hair Repair Mask',
    type: STOCK_MOVEMENT_TYPES.SALE,
    quantity: -5,
    notes: 'Online orders',
    user: 'System'
  },
  {
    id: 'SM-1004',
    date: '2023-09-26',
    productId: 1,
    productName: 'Moisturizing Cream',
    type: STOCK_MOVEMENT_TYPES.SALE,
    quantity: -3,
    notes: 'In-store purchase',
    user: 'Njeri Mwangi'
  },
  {
    id: 'SM-1005',
    date: '2023-09-27',
    productId: 1,
    productName: 'Moisturizing Cream',
    type: STOCK_MOVEMENT_TYPES.DAMAGED,
    quantity: -2,
    notes: 'Damaged during shipping',
    user: 'Faith Mwende'
  },
  {
    id: 'SM-1006',
    date: '2023-09-28',
    productId: 2,
    productName: 'Anti-Aging Serum',
    type: STOCK_MOVEMENT_TYPES.ADJUSTMENT,
    quantity: -1,
    notes: 'Inventory count adjustment',
    user: 'James Kamau'
  },
  {
    id: 'SM-1007',
    date: '2023-09-28',
    productId: 3,
    productName: 'Citrus Perfume',
    type: STOCK_MOVEMENT_TYPES.RETURN,
    quantity: 1,
    notes: 'Customer return - unopened',
    user: 'Njeri Mwangi'
  },
  {
    id: 'SM-1008',
    date: '2023-09-29',
    productId: 5,
    productName: 'Shower Gel',
    type: STOCK_MOVEMENT_TYPES.TRANSFER,
    quantity: -10,
    notes: 'Transferred to Mombasa branch',
    user: 'David Mutua'
  },
  {
    id: 'SM-1009',
    date: '2023-09-30',
    productId: 6,
    productName: 'Day Cream SPF 30',
    type: STOCK_MOVEMENT_TYPES.PURCHASE,
    quantity: 35,
    notes: 'New supplier - Skin Protectors Ltd',
    user: 'David Mutua'
  },
  {
    id: 'SM-1010',
    date: '2023-10-01',
    productId: 4,
    productName: 'Hair Repair Mask',
    type: STOCK_MOVEMENT_TYPES.ADJUSTMENT,
    quantity: 3,
    notes: 'Found additional stock during inventory',
    user: 'James Kamau'
  },
];

// Low stock alerts data
export const lowStockAlerts = [
  {
    id: 'LSA-001',
    productId: 3,
    productName: 'Citrus Perfume',
    currentStock: 12,
    threshold: 15,
    status: 'active',
    createdAt: '2023-09-25',
    resolved: false
  },
  {
    id: 'LSA-002',
    productId: 8,
    productName: 'Face Mask',
    currentStock: 5,
    threshold: 10,
    status: 'critical',
    createdAt: '2023-09-24',
    resolved: false
  },
  {
    id: 'LSA-003',
    productId: 4,
    productName: 'Hair Repair Mask',
    currentStock: 0,
    threshold: 10,
    status: 'outOfStock',
    createdAt: '2023-09-23',
    resolved: false,
    autoOrderSent: true,
    poNumber: 'PO-2023-091'
  },
  {
    id: 'LSA-004',
    productId: 9,
    productName: 'Night Repair Serum',
    currentStock: 8,
    threshold: 12,
    status: 'active',
    createdAt: '2023-09-22',
    resolved: false
  },
  {
    id: 'LSA-005',
    productId: 5,
    productName: 'Shower Gel',
    currentStock: 14,
    threshold: 15,
    status: 'active',
    createdAt: '2023-09-26',
    resolved: false
  },
  {
    id: 'LSA-006',
    productId: 7,
    productName: 'Body Butter',
    currentStock: 6,
    threshold: 12,
    status: 'active',
    createdAt: '2023-09-20',
    resolved: true,
    resolvedAt: '2023-09-28',
    resolvedBy: 'David Mutua',
    notes: 'Ordered 30 units from supplier'
  }
];

// Inventory status over time (for charts)
export const inventoryTrends = {
  labels: ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
  stockLevels: [280, 250, 310, 340, 380, 290, 320, 300, 350, 370, 390, 400],
  stockValue: [15000, 13800, 17200, 19000, 21500, 16200, 17800, 16500, 19800, 21000, 22500, 23000],
  lowStockIncidents: [3, 5, 2, 1, 4, 7, 5, 3, 4, 2, 3, 2]
};

// Suppliers data
export const suppliers = [
  {
    id: 'SUP-001',
    name: 'Kenya Cosmetics Ltd.',
    contact: 'Janet Muthoni',
    email: 'orders@kenyacosmetics.co.ke',
    phone: '+254 722 123 456',
    address: 'Industrial Area, Nairobi',
    products: [1, 2, 6, 10]
  },
  {
    id: 'SUP-002',
    name: 'Nairobi Fragrances',
    contact: 'Michael Omondi',
    email: 'sales@nairobifragrances.com',
    phone: '+254 733 987 654',
    address: 'Westlands, Nairobi',
    products: [3, 7]
  },
  {
    id: 'SUP-003',
    name: 'Skin Protectors Ltd',
    contact: 'Alice Njeri',
    email: 'orders@skinprotectors.co.ke',
    phone: '+254 722 456 789',
    address: 'Karen, Nairobi',
    products: [6, 9]
  },
  {
    id: 'SUP-004',
    name: 'Hair Care Kenya',
    contact: 'John Kimani',
    email: 'supply@haircareafrica.com',
    phone: '+254 722 321 654',
    address: 'Mombasa Road, Nairobi',
    products: [4, 5, 8]
  }
];

// Stock replenishment settings
export const stockSettings = {
  lowStockThreshold: 15,
  criticalStockThreshold: 5,
  autoOrderThreshold: 3,
  defaultLeadTime: 7, // days
  autoNotify: true,
  notificationRecipients: [
    'inventory@clinique-beauty.co.ke',
    'purchasing@clinique-beauty.co.ke'
  ],
  autoOrder: {
    enabled: true,
    approvalRequired: true,
    approvers: [
      'david.mutua@clinique-beauty.co.ke',
      'ceo@clinique-beauty.co.ke'
    ]
  }
};

// Add products data for supplier management
export const products = [
  { id: 1, name: 'Moisturizing Cream', category: 'Skincare', stockLevel: 45, safetyStock: 20 },
  { id: 2, name: 'Anti-Aging Serum', category: 'Skincare', stockLevel: 32, safetyStock: 15 },
  { id: 3, name: 'Citrus Perfume', category: 'Fragrance', stockLevel: 12, safetyStock: 10 },
  { id: 4, name: 'Hair Repair Mask', category: 'Hair Care', stockLevel: 8, safetyStock: 12 },
  { id: 5, name: 'Shower Gel', category: 'Body Care', stockLevel: 36, safetyStock: 18 },
  { id: 6, name: 'Day Cream SPF 30', category: 'Skincare', stockLevel: 22, safetyStock: 15 },
  { id: 7, name: 'Body Butter', category: 'Body Care', stockLevel: 28, safetyStock: 14 },
  { id: 8, name: 'Face Mask', category: 'Skincare', stockLevel: 18, safetyStock: 10 },
  { id: 9, name: 'Night Repair Serum', category: 'Skincare', stockLevel: 15, safetyStock: 8 },
  { id: 10, name: 'Lip Balm', category: 'Skincare', stockLevel: 40, safetyStock: 25 },
];

// Add adjustment history data for audit logs
export const adjustmentHistory = [
  { 
    id: 'ADJ-001', 
    date: '2023-10-10 09:15', 
    productId: 1, 
    productName: 'Moisturizing Cream', 
    type: STOCK_MOVEMENT_TYPES.ADJUSTMENT, 
    quantity: 5, 
    reason: 'Found additional stock during inventory count', 
    user: 'David Mutua', 
    notes: 'Verified by store manager'
  },
  { 
    id: 'ADJ-002', 
    date: '2023-10-09 14:30', 
    productId: 3, 
    productName: 'Citrus Perfume', 
    type: STOCK_MOVEMENT_TYPES.DAMAGED, 
    quantity: -2, 
    reason: 'Damaged in storage', 
    user: 'Njeri Mwangi', 
    notes: 'Items properly disposed'
  },
  { 
    id: 'ADJ-003', 
    date: '2023-10-08 11:45', 
    productId: 4, 
    productName: 'Hair Repair Mask', 
    type: STOCK_MOVEMENT_TYPES.ADJUSTMENT, 
    quantity: -3, 
    reason: 'Inventory count mismatch', 
    user: 'James Kamau', 
    notes: 'Will investigate discrepancy'
  },
  { 
    id: 'ADJ-004', 
    date: '2023-10-07 16:20', 
    productId: 2, 
    productName: 'Anti-Aging Serum', 
    type: STOCK_MOVEMENT_TYPES.RETURN, 
    quantity: 1, 
    reason: 'Customer return - unopened', 
    user: 'Faith Mwende', 
    notes: 'Item inspected and returned to inventory'
  }
];

export default {
  stockMovements,
  lowStockAlerts,
  inventoryTrends,
  suppliers,
  stockSettings,
  products,
  adjustmentHistory
};
