/**
 * Mock user data for development and testing
 */

export const mockUsers = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'Customer',
    status: 'Active',
    verified: true,
    joinDate: '2023-01-15',
    location: 'New York',
    ordersCount: 8,
    totalSpent: 425.75,
    avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
    allowMarketing: true
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'Customer',
    status: 'Active',
    verified: true,
    joinDate: '2023-02-20',
    location: 'Los Angeles',
    ordersCount: 12,
    totalSpent: 789.99,
    avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
    allowMarketing: true
  },
  {
    id: '3',
    name: 'Robert Johnson',
    email: 'robert@example.com',
    role: 'Seller',
    status: 'Active',
    verified: true,
    joinDate: '2023-01-05',
    location: 'Chicago',
    ordersCount: 0,
    totalSpent: 0,
    avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
    allowMarketing: false
  },
  {
    id: '4',
    name: 'Emily Davis',
    email: 'emily@example.com',
    role: 'Customer',
    status: 'Inactive',
    verified: false,
    joinDate: '2023-03-10',
    location: 'Boston',
    ordersCount: 3,
    totalSpent: 129.50,
    avatar: 'https://randomuser.me/api/portraits/women/4.jpg',
    allowMarketing: true
  },
  {
    id: '5',
    name: 'Michael Wilson',
    email: 'michael@example.com',
    role: 'Admin',
    status: 'Active',
    verified: true,
    joinDate: '2023-01-01',
    location: 'San Francisco',
    ordersCount: 0,
    totalSpent: 0,
    avatar: 'https://randomuser.me/api/portraits/men/5.jpg',
    allowMarketing: true
  },
  {
    id: '6',
    name: 'Sarah Brown',
    email: 'sarah@example.com',
    role: 'Customer',
    status: 'Pending',
    verified: false,
    joinDate: '2023-03-18',
    location: 'Dallas',
    ordersCount: 1,
    totalSpent: 49.99,
    avatar: 'https://randomuser.me/api/portraits/women/6.jpg',
    allowMarketing: false
  },
  {
    id: '7',
    name: 'David Miller',
    email: 'david@example.com',
    role: 'Customer',
    status: 'Active',
    verified: true,
    joinDate: '2023-02-12',
    location: 'Seattle',
    ordersCount: 5,
    totalSpent: 275.50,
    avatar: 'https://randomuser.me/api/portraits/men/7.jpg',
    allowMarketing: true
  },
  {
    id: '8',
    name: 'Jennifer Lee',
    email: 'jennifer@example.com',
    role: 'Seller',
    status: 'Active',
    verified: true,
    joinDate: '2023-01-22',
    location: 'Miami',
    ordersCount: 0,
    totalSpent: 0,
    avatar: 'https://randomuser.me/api/portraits/women/8.jpg',
    allowMarketing: true
  }
];

export default mockUsers;
