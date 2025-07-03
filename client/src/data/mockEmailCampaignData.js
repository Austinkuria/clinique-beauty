export const emailCampaigns = [
  {
    id: 'em-001',
    name: 'Summer Sale Announcement',
    subject: 'Summer Sale: Up to 50% Off Your Favorite Beauty Products',
    status: 'sent',
    scheduledDate: '2025-06-15T08:00:00',
    sentDate: '2025-06-15T08:00:00',
    recipients: {
      segmentType: 'segment',
      segmentId: 'seg-001',
      segmentName: 'All Customers',
      count: 2500
    },
    performance: {
      delivered: 2450,
      opened: 1200,
      clicked: 800,
      openRate: 48.98,
      clickRate: 32.65,
      revenue: 12500
    },
    content: {
      template: 'summer-sale',
      header: 'The Summer Sale Is Here!',
      body: '<p>Dear {customer_name},</p><p>We\'re excited to announce our biggest summer sale yet! Enjoy up to 50% off across our entire range of beauty products.</p><p>This is the perfect time to stock up on your favorites or try something new.</p>',
      featuredProducts: [101, 203, 156],
      cta: {
        text: 'Shop Now',
        url: '/summer-sale'
      }
    }
  },
  {
    id: 'em-002',
    name: 'New Product Launch - Vitamin C Serum',
    subject: 'Introducing Our New Vitamin C Serum',
    status: 'sent',
    scheduledDate: '2025-07-10T09:00:00',
    sentDate: '2025-07-10T09:00:00',
    recipients: {
      segmentType: 'segment',
      segmentId: 'seg-002',
      segmentName: 'Skincare Enthusiasts',
      count: 1200
    },
    performance: {
      delivered: 1180,
      opened: 900,
      clicked: 600,
      openRate: 76.27,
      clickRate: 50.85,
      revenue: 8900
    },
    content: {
      template: 'product-launch',
      header: 'Meet Your Skin\'s New Best Friend',
      body: '<p>Dear {customer_name},</p><p>We\'re thrilled to introduce our new Vitamin C Serum, formulated to brighten your skin and even out your complexion.</p><p>Packed with antioxidants and made with all-natural ingredients, this serum is perfect for daily use.</p>',
      featuredProducts: [301],
      cta: {
        text: 'Discover More',
        url: '/products/vitamin-c-serum'
      }
    }
  },
  {
    id: 'em-003',
    name: 'Welcome Series - Email 1',
    subject: 'Welcome to Clinique Beauty',
    status: 'active',
    automationType: 'welcome_series',
    triggeredOn: 'signup',
    recipients: {
      segmentType: 'dynamic',
      segmentName: 'New Customers',
      description: 'Sent automatically to new customers upon signup'
    },
    performance: {
      delivered: 350,
      opened: 300,
      clicked: 200,
      openRate: 85.71,
      clickRate: 57.14,
      revenue: 3200
    },
    content: {
      template: 'welcome',
      header: 'Welcome to the Clinique Beauty Family!',
      body: '<p>Dear {customer_name},</p><p>Thank you for joining Clinique Beauty! We\'re excited to have you as part of our community.</p><p>At Clinique Beauty, we believe in providing high-quality, natural beauty products that enhance your natural beauty.</p>',
      cta: {
        text: 'Start Shopping',
        url: '/new-arrivals'
      }
    }
  },
  {
    id: 'em-004',
    name: 'Abandoned Cart Reminder',
    subject: 'You left items in your cart',
    status: 'active',
    automationType: 'abandoned_cart',
    triggeredOn: 'cart_abandonment',
    triggerDelay: '24_hours',
    recipients: {
      segmentType: 'dynamic',
      segmentName: 'Cart Abandoners',
      description: 'Sent automatically to customers who abandon their cart'
    },
    performance: {
      delivered: 580,
      opened: 320,
      clicked: 150,
      openRate: 55.17,
      clickRate: 25.86,
      revenue: 7200
    },
    content: {
      template: 'cart-reminder',
      header: 'You forgot something!',
      body: '<p>Dear {customer_name},</p><p>We noticed you left some items in your cart.</p><p>Your selections are still waiting for you, and we\'ve kept them safe. Complete your purchase now before they sell out!</p>',
      dynamicContent: '{cart_items}',
      cta: {
        text: 'Complete Purchase',
        url: '{cart_url}'
      }
    }
  },
  {
    id: 'em-005',
    name: 'Fall Collection Preview',
    subject: 'Exclusive Preview: Fall 2025 Collection',
    status: 'draft',
    recipients: {
      segmentType: 'segment',
      segmentId: 'seg-003',
      segmentName: 'VIP Customers',
      count: 500
    },
    content: {
      template: 'seasonal',
      header: 'Fall in Love with Our New Collection',
      body: '<p>Dear {customer_name},</p><p>As one of our valued VIP customers, we\'re giving you an exclusive preview of our Fall 2025 Collection before it\'s officially released.</p><p>Embrace the autumn season with our warm, rich tones and nourishing formulas designed for the changing weather.</p>',
      featuredProducts: [402, 405, 410],
      cta: {
        text: 'Get Early Access',
        url: '/fall-preview'
      }
    }
  },
  {
    id: 'em-006',
    name: 'Customer Feedback Request',
    subject: 'We value your opinion',
    status: 'scheduled',
    scheduledDate: '2025-10-05T10:00:00',
    recipients: {
      segmentType: 'segment',
      segmentId: 'seg-004',
      segmentName: 'Recent Purchasers',
      count: 800
    },
    content: {
      template: 'feedback',
      header: 'How Did We Do?',
      body: '<p>Dear {customer_name},</p><p>Thank you for your recent purchase from Clinique Beauty.</p><p>We\'d love to hear about your experience with our products. Your feedback helps us improve and better serve you.</p>',
      cta: {
        text: 'Take Our Survey',
        url: '/feedback?id={customer_id}'
      }
    }
  }
];

export const emailTemplates = [
  { id: 'welcome', name: 'Welcome Email', thumbnail: '/images/email-templates/welcome.jpg' },
  { id: 'product-launch', name: 'Product Launch', thumbnail: '/images/email-templates/product-launch.jpg' },
  { id: 'summer-sale', name: 'Summer Sale', thumbnail: '/images/email-templates/summer-sale.jpg' },
  { id: 'seasonal', name: 'Seasonal', thumbnail: '/images/email-templates/seasonal.jpg' },
  { id: 'cart-reminder', name: 'Cart Reminder', thumbnail: '/images/email-templates/cart-reminder.jpg' },
  { id: 'feedback', name: 'Feedback Request', thumbnail: '/images/email-templates/feedback.jpg' },
  { id: 'newsletter', name: 'Newsletter', thumbnail: '/images/email-templates/newsletter.jpg' },
  { id: 'birthday', name: 'Birthday Special', thumbnail: '/images/email-templates/birthday.jpg' }
];

export const emailSegments = [
  { id: 'seg-001', name: 'All Customers', count: 2500, criteria: 'all customers' },
  { id: 'seg-002', name: 'Skincare Enthusiasts', count: 1200, criteria: 'purchased skincare products' },
  { id: 'seg-003', name: 'VIP Customers', count: 500, criteria: 'spent over $500 in past 6 months' },
  { id: 'seg-004', name: 'Recent Purchasers', count: 800, criteria: 'purchased in last 30 days' },
  { id: 'seg-005', name: 'Dormant Customers', count: 1500, criteria: 'no purchases in 6+ months' },
  { id: 'seg-006', name: 'Newsletter Subscribers', count: 3200, criteria: 'subscribed to newsletter' }
];
