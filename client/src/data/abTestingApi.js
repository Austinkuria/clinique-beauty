// Mock API for A/B testing functionality

// Helper function to generate random results for test variants
const generateRandomResults = (variants, testGoal) => {
  return variants.map(variant => {
    // Base metrics
    const participants = Math.floor(Math.random() * 2000) + 500;
    const conversionRate = (Math.random() * 5 + 2).toFixed(2); // 2-7%
    const avgOrderValue = (Math.random() * 30 + 40).toFixed(2); // $40-70
    const revenue = (participants * (conversionRate / 100) * avgOrderValue).toFixed(2);
    const clickRate = (Math.random() * 15 + 5).toFixed(2); // 5-20%
    
    // For the control variant, make it slightly worse on average
    const multiplier = variant.name === 'Control' ? 0.9 : 1 + (Math.random() * 0.4 - 0.1);
    
    return {
      variant: variant.name,
      participants,
      conversionRate: (conversionRate * multiplier).toFixed(2),
      avgOrderValue: (avgOrderValue * multiplier).toFixed(2),
      revenue: (revenue * multiplier).toFixed(2),
      clickRate: (clickRate * multiplier).toFixed(2),
      significant: Math.random() > 0.5
    };
  });
};

// Generate time series data for test performance over time
const generateTimeSeriesData = (variants, days = 14) => {
  const data = [];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    
    const entry = {
      date: date.toISOString().split('T')[0]
    };
    
    // Add data for each variant
    variants.forEach(variant => {
      // Start with base metrics that improve over time
      const baseValue = variant.name === 'Control' ? 3 : 3.5; // base conversion rate
      const trend = Math.min(i / days * 2, 1); // upward trend factor
      const noise = (Math.random() * 0.6) - 0.3; // random noise
      
      // Different growth rates for different variants
      const growthFactor = variant.name === 'Control' ? 1 : 
                           variant.name === 'Variant A' ? 1.2 : 
                           variant.name === 'Variant B' ? 1.3 : 1.1;
      
      entry[variant.name] = ((baseValue + (trend * 2 * growthFactor)) * (1 + noise)).toFixed(2);
    });
    
    data.push(entry);
  }
  
  return data;
};

// Mock data for A/B tests
const mockTests = [
  {
    id: 1,
    name: 'Summer Sale Banner Test',
    description: 'Testing different banner designs for the summer sale campaign',
    status: 'active',
    startDate: '2023-06-01',
    endDate: '2023-06-15',
    target: 'all_users',
    testGoal: 'conversion_rate',
    sampleSize: 100,
    participants: 5420,
    variants: [
      { name: 'Control', description: 'Current banner design', trafficAllocation: 33 },
      { name: 'Variant A', description: 'New design with more vibrant colors', trafficAllocation: 33 },
      { name: 'Variant B', description: 'New design with larger CTA button', trafficAllocation: 34 }
    ],
    confidence: 95,
    // These will be calculated
    results: null,
    timeSeries: null
  },
  {
    id: 2,
    name: 'Product Page Layout Test',
    description: 'Testing different layouts for product detail pages',
    status: 'completed',
    startDate: '2023-05-01',
    endDate: '2023-05-15',
    target: 'all_users',
    testGoal: 'conversion_rate',
    sampleSize: 100,
    participants: 8790,
    variants: [
      { name: 'Control', description: 'Current layout', trafficAllocation: 50 },
      { name: 'Variant A', description: 'New layout with reviews at the top', trafficAllocation: 50 }
    ],
    confidence: 98,
    // These will be calculated
    results: null,
    timeSeries: null
  },
  {
    id: 3,
    name: 'Free Shipping Threshold Test',
    description: 'Testing different free shipping thresholds ($35 vs $50)',
    status: 'scheduled',
    startDate: '2023-07-01',
    endDate: '2023-07-15',
    target: 'all_users',
    testGoal: 'avg_order_value',
    sampleSize: 100,
    participants: 0,
    variants: [
      { name: 'Control', description: '$50 free shipping threshold', trafficAllocation: 50 },
      { name: 'Variant A', description: '$35 free shipping threshold', trafficAllocation: 50 }
    ],
    confidence: 0,
    // These will be calculated
    results: null,
    timeSeries: null
  },
  {
    id: 4,
    name: 'Checkout Process Test',
    description: 'Testing single-page vs multi-step checkout process',
    status: 'active',
    startDate: '2023-06-10',
    endDate: '2023-06-24',
    target: 'all_users',
    testGoal: 'conversion_rate',
    sampleSize: 50,
    participants: 2340,
    variants: [
      { name: 'Control', description: 'Multi-step checkout', trafficAllocation: 50 },
      { name: 'Variant A', description: 'Single-page checkout', trafficAllocation: 50 }
    ],
    confidence: 70,
    // These will be calculated
    results: null,
    timeSeries: null
  },
  {
    id: 5,
    name: 'Discount Display Test',
    description: 'Testing display of discounts: percentage vs absolute amount',
    status: 'draft',
    startDate: '2023-07-15',
    endDate: '2023-07-29',
    target: 'all_users',
    testGoal: 'conversion_rate',
    sampleSize: 100,
    participants: 0,
    variants: [
      { name: 'Control', description: 'Show percentage discount', trafficAllocation: 50 },
      { name: 'Variant A', description: 'Show absolute amount saved', trafficAllocation: 50 }
    ],
    confidence: 0,
    // These will be calculated
    results: null,
    timeSeries: null
  }
];

// Add calculated data to tests
mockTests.forEach(test => {
  if (test.status === 'active' || test.status === 'completed') {
    test.results = generateRandomResults(test.variants, test.testGoal);
    test.timeSeries = generateTimeSeriesData(test.variants, 14);
  }
});

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API methods
export const abTestingApi = {
  // Get all A/B tests
  getTests: async () => {
    await delay(600);
    return { data: [...mockTests] };
  },
  
  // Get a specific test by ID
  getTestById: async (id) => {
    await delay(300);
    const test = mockTests.find(t => t.id === parseInt(id));
    if (!test) {
      throw new Error('Test not found');
    }
    return { data: {...test} };
  },
  
  // Create a new test
  createTest: async (testData) => {
    await delay(800);
    const newTest = {
      id: mockTests.length + 1,
      ...testData,
      status: 'draft',
      participants: 0,
      confidence: 0,
      results: null,
      timeSeries: null
    };
    mockTests.push(newTest);
    return { data: newTest };
  },
  
  // Update an existing test
  updateTest: async (id, testData) => {
    await delay(500);
    const index = mockTests.findIndex(t => t.id === parseInt(id));
    if (index === -1) {
      throw new Error('Test not found');
    }
    
    const updatedTest = {
      ...mockTests[index],
      ...testData
    };
    mockTests[index] = updatedTest;
    return { data: updatedTest };
  },
  
  // Start a test
  startTest: async (id) => {
    await delay(500);
    const index = mockTests.findIndex(t => t.id === parseInt(id));
    if (index === -1) {
      throw new Error('Test not found');
    }
    
    mockTests[index].status = 'active';
    if (!mockTests[index].results) {
      mockTests[index].results = generateRandomResults(mockTests[index].variants, mockTests[index].testGoal);
      mockTests[index].timeSeries = generateTimeSeriesData(mockTests[index].variants, 7);
    }
    
    return { data: mockTests[index] };
  },
  
  // Stop a test
  stopTest: async (id) => {
    await delay(500);
    const index = mockTests.findIndex(t => t.id === parseInt(id));
    if (index === -1) {
      throw new Error('Test not found');
    }
    
    mockTests[index].status = 'completed';
    mockTests[index].confidence = Math.floor(Math.random() * 30) + 70; // 70-99% confidence
    
    return { data: mockTests[index] };
  },
  
  // Delete a test
  deleteTest: async (id) => {
    await delay(700);
    const index = mockTests.findIndex(t => t.id === parseInt(id));
    if (index === -1) {
      throw new Error('Test not found');
    }
    
    const deletedTest = mockTests[index];
    mockTests.splice(index, 1);
    
    return { data: deletedTest };
  }
};
