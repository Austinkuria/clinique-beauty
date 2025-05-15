/**
 * Mock data for A/B testing features
 */

// Sample AB test data
export const mockAbTestingData = {
  abTests: [
    {
      id: '1',
      name: 'Homepage Banner Test',
      description: 'Testing different banner designs to increase click-through rate',
      status: 'active',
      startDate: '2023-06-01',
      endDate: '2023-06-30',
      testGoal: 'conversion_rate',
      target: 'all_users',
      createdAt: '2023-05-29T10:15:00Z',
      startedAt: '2023-06-01T00:00:00Z',
      participants: 5842,
      variants: [
        { name: 'Control', description: 'Current banner design', trafficAllocation: 33 },
        { name: 'Variant A', description: 'New design with product focus', trafficAllocation: 33 },
        { name: 'Variant B', description: 'New design with lifestyle focus', trafficAllocation: 34 }
      ],
      results: [
        { 
          variant: 'Control', 
          participants: 1932, 
          conversionRate: 2.7, 
          clickRate: 3.4, 
          avgOrderValue: 52.75, 
          revenue: 2750.48,
          significant: false
        },
        { 
          variant: 'Variant A', 
          participants: 1926, 
          conversionRate: 3.5, 
          clickRate: 4.2, 
          avgOrderValue: 58.92, 
          revenue: 3980.23,
          significant: true
        },
        { 
          variant: 'Variant B', 
          participants: 1984, 
          conversionRate: 3.2, 
          clickRate: 3.9, 
          avgOrderValue: 55.38, 
          revenue: 3512.14,
          significant: true
        }
      ],
      confidence: 95,
      timeSeries: [
        {
          date: '2023-06-01',
          'Control': 2.2,
          'Variant A': 3.1,
          'Variant B': 2.9
        },
        {
          date: '2023-06-08',
          'Control': 2.5,
          'Variant A': 3.3,
          'Variant B': 3.1
        },
        {
          date: '2023-06-15',
          'Control': 2.6,
          'Variant A': 3.5,
          'Variant B': 3.2
        },
        {
          date: '2023-06-22',
          'Control': 2.7,
          'Variant A': 3.5,
          'Variant B': 3.2
        }
      ]
    },
    {
      id: '2',
      name: 'Product Page Layout Test',
      description: 'Testing different product page layouts to improve conversion',
      status: 'scheduled',
      startDate: '2023-07-01',
      endDate: '2023-07-31',
      testGoal: 'conversion_rate',
      target: 'all_users',
      createdAt: '2023-06-15T14:30:00Z',
      participants: 0,
      variants: [
        { name: 'Control', description: 'Current layout', trafficAllocation: 50 },
        { name: 'Variant A', description: 'New layout with larger images', trafficAllocation: 50 }
      ],
      results: null,
      timeSeries: null
    },
    {
      id: '3',
      name: 'Checkout Flow Test',
      description: 'Testing simplified checkout flow vs. current checkout',
      status: 'completed',
      startDate: '2023-05-01',
      endDate: '2023-05-31',
      testGoal: 'conversion_rate',
      target: 'all_users',
      createdAt: '2023-04-20T09:45:00Z',
      startedAt: '2023-05-01T00:00:00Z',
      completedAt: '2023-05-31T23:59:59Z',
      participants: 8934,
      variants: [
        { name: 'Control', description: 'Current checkout flow', trafficAllocation: 50 },
        { name: 'Variant A', description: 'Simplified checkout flow', trafficAllocation: 50 }
      ],
      results: [
        { 
          variant: 'Control', 
          participants: 4467, 
          conversionRate: 62.3, 
          clickRate: 68.5, 
          avgOrderValue: 67.82, 
          revenue: 15679.42,
          significant: false
        },
        { 
          variant: 'Variant A', 
          participants: 4467, 
          conversionRate: 78.1, 
          clickRate: 82.3, 
          avgOrderValue: 69.45, 
          revenue: 21287.35,
          significant: true
        }
      ],
      confidence: 99,
      timeSeries: [
        {
          date: '2023-05-01',
          'Control': 61.5,
          'Variant A': 72.8
        },
        {
          date: '2023-05-08',
          'Control': 62.1,
          'Variant A': 74.3
        },
        {
          date: '2023-05-15',
          'Control': 62.5,
          'Variant A': 76.2
        },
        {
          date: '2023-05-22',
          'Control': 62.4,
          'Variant A': 77.8
        },
        {
          date: '2023-05-29',
          'Control': 62.3,
          'Variant A': 78.1
        }
      ]
    },
    {
      id: '4',
      name: 'Email Subject Line Test',
      description: 'Testing different email subject lines for the summer campaign',
      status: 'active',
      startDate: '2023-06-10',
      endDate: '2023-06-25',
      testGoal: 'clicks',
      target: 'all_users',
      createdAt: '2023-06-05T11:20:00Z',
      startedAt: '2023-06-10T00:00:00Z',
      participants: 20000,
      variants: [
        { name: 'Control', description: 'Standard subject line', trafficAllocation: 25 },
        { name: 'Variant A', description: 'Subject with urgency', trafficAllocation: 25 },
        { name: 'Variant B', description: 'Subject with personalization', trafficAllocation: 25 },
        { name: 'Variant C', description: 'Subject with discount mention', trafficAllocation: 25 }
      ],
      results: [
        { 
          variant: 'Control', 
          participants: 5000, 
          conversionRate: 1.2, 
          clickRate: 3.8, 
          avgOrderValue: 48.93, 
          revenue: 293.58,
          significant: false
        },
        { 
          variant: 'Variant A', 
          participants: 5000, 
          conversionRate: 1.4, 
          clickRate: 4.2, 
          avgOrderValue: 52.15, 
          revenue: 365.05,
          significant: false
        },
        { 
          variant: 'Variant B', 
          participants: 5000, 
          conversionRate: 1.3, 
          clickRate: 4.1, 
          avgOrderValue: 51.72, 
          revenue: 336.18,
          significant: false
        },
        { 
          variant: 'Variant C', 
          participants: 5000, 
          conversionRate: 2.1, 
          clickRate: 6.7, 
          avgOrderValue: 47.64, 
          revenue: 500.22,
          significant: true
        }
      ],
      confidence: 92,
      timeSeries: [
        {
          date: '2023-06-10',
          'Control': 3.8,
          'Variant A': 4.2,
          'Variant B': 4.1,
          'Variant C': 6.5
        },
        {
          date: '2023-06-15',
          'Control': 3.8,
          'Variant A': 4.2,
          'Variant B': 4.1,
          'Variant C': 6.6
        },
        {
          date: '2023-06-20',
          'Control': 3.8,
          'Variant A': 4.2,
          'Variant B': 4.1,
          'Variant C': 6.7
        }
      ]
    },
    {
      id: '5',
      name: 'Free Shipping Threshold Test',
      description: 'Testing different free shipping thresholds to optimize AOV',
      status: 'draft',
      startDate: '2023-07-15',
      endDate: '2023-08-15',
      testGoal: 'avg_order_value',
      target: 'all_users',
      createdAt: '2023-06-18T16:40:00Z',
      participants: 0,
      variants: [
        { name: 'Control', description: 'Current $50 threshold', trafficAllocation: 33 },
        { name: 'Variant A', description: '$35 threshold', trafficAllocation: 33 },
        { name: 'Variant B', description: '$75 threshold', trafficAllocation: 34 }
      ],
      results: null,
      timeSeries: null
    }
  ]
};
