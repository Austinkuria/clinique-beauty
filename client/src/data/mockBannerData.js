export const banners = [
  {
    id: 'ban-001',
    title: 'Summer Sale',
    subtitle: 'Up to 50% off on selected items',
    imageUrl: '/images/banners/summer-sale.jpg',
    mobileImageUrl: '/images/banners/mobile/summer-sale.jpg',
    link: '/sale',
    backgroundColor: '#F8D7DA', // Light pink
    textColor: '#721C24', // Dark red
    position: 'hero',
    status: 'active',
    startDate: '2025-06-15T00:00:00',
    endDate: '2025-07-15T23:59:59',
    priority: 1,
    buttonText: 'Shop Now',
    buttonColor: '#DC3545', // Red
    views: 12450,
    clicks: 2800,
    ctr: 22.49
  },
  {
    id: 'ban-002',
    title: 'New Arrivals',
    subtitle: 'Check out our latest products',
    imageUrl: '/images/banners/new-arrivals.jpg',
    mobileImageUrl: '/images/banners/mobile/new-arrivals.jpg',
    link: '/new-arrivals',
    backgroundColor: '#D4EDDA', // Light green
    textColor: '#155724', // Dark green
    position: 'hero',
    status: 'scheduled',
    startDate: '2025-07-16T00:00:00',
    endDate: '2025-08-16T23:59:59',
    priority: 2,
    buttonText: 'Discover',
    buttonColor: '#28A745', // Green
    views: 0,
    clicks: 0,
    ctr: 0
  },
  {
    id: 'ban-003',
    title: 'Free Shipping',
    subtitle: 'On all orders over $50',
    imageUrl: '/images/banners/free-shipping.jpg',
    mobileImageUrl: '/images/banners/mobile/free-shipping.jpg',
    link: '/shipping',
    backgroundColor: '#CCE5FF', // Light blue
    textColor: '#004085', // Dark blue
    position: 'secondary',
    status: 'active',
    startDate: '2025-06-01T00:00:00',
    endDate: '2025-12-31T23:59:59',
    priority: 1,
    buttonText: 'Learn More',
    buttonColor: '#007BFF', // Blue
    views: 8500,
    clicks: 1200,
    ctr: 14.12
  },
  {
    id: 'ban-004',
    title: 'Refer a Friend',
    subtitle: 'Get $10 credit for each referral',
    imageUrl: '/images/banners/referral.jpg',
    mobileImageUrl: '/images/banners/mobile/referral.jpg',
    link: '/referral',
    backgroundColor: '#E2E3E5', // Light gray
    textColor: '#383D41', // Dark gray
    position: 'secondary',
    status: 'active',
    startDate: '2025-05-01T00:00:00',
    endDate: '2025-12-31T23:59:59',
    priority: 2,
    buttonText: 'Refer Now',
    buttonColor: '#6C757D', // Gray
    views: 7800,
    clicks: 950,
    ctr: 12.18
  },
  {
    id: 'ban-005',
    title: 'Fall Collection',
    subtitle: 'Embrace the colors of autumn',
    imageUrl: '/images/banners/fall-collection.jpg',
    mobileImageUrl: '/images/banners/mobile/fall-collection.jpg',
    link: '/collections/fall',
    backgroundColor: '#FFF3CD', // Light yellow
    textColor: '#856404', // Dark yellow
    position: 'hero',
    status: 'draft',
    startDate: '2025-09-01T00:00:00',
    endDate: '2025-10-31T23:59:59',
    priority: 1,
    buttonText: 'View Collection',
    buttonColor: '#FFC107', // Yellow
    views: 0,
    clicks: 0,
    ctr: 0
  }
];

export const featuredContent = [
  {
    id: 'feat-001',
    title: 'Skincare Routine Guide',
    subtitle: 'Build the perfect routine for your skin type',
    type: 'article',
    imageUrl: '/images/featured/skincare-guide.jpg',
    link: '/blog/skincare-routine-guide',
    status: 'active',
    startDate: '2025-06-01T00:00:00',
    endDate: '2025-08-31T23:59:59',
    category: 'skincare',
    position: 'homepage',
    priority: 1,
    views: 3500,
    engagements: 1200
  },
  {
    id: 'feat-002',
    title: 'Summer Makeup Looks',
    subtitle: 'Fresh and glowing looks for summer',
    type: 'tutorial',
    imageUrl: '/images/featured/summer-makeup.jpg',
    link: '/tutorials/summer-makeup',
    status: 'active',
    startDate: '2025-06-15T00:00:00',
    endDate: '2025-08-31T23:59:59',
    category: 'makeup',
    position: 'homepage',
    priority: 2,
    views: 2800,
    engagements: 950
  },
  {
    id: 'feat-003',
    title: 'Meet Our Founder',
    subtitle: 'The story behind Clinique Beauty',
    type: 'article',
    imageUrl: '/images/featured/founder-story.jpg',
    link: '/about/founder-story',
    status: 'active',
    startDate: '2025-01-01T00:00:00',
    endDate: '2025-12-31T23:59:59',
    category: 'company',
    position: 'about',
    priority: 1,
    views: 1500,
    engagements: 300
  },
  {
    id: 'feat-004',
    title: 'Sustainable Beauty',
    subtitle: 'Our commitment to the environment',
    type: 'video',
    imageUrl: '/images/featured/sustainable-beauty.jpg',
    videoUrl: 'https://www.youtube.com/embed/abc123',
    link: '/sustainability',
    status: 'active',
    startDate: '2025-04-22T00:00:00',
    endDate: '2025-12-31T23:59:59',
    category: 'sustainability',
    position: 'about',
    priority: 2,
    views: 1800,
    engagements: 600
  },
  {
    id: 'feat-005',
    title: 'Fall Skincare Tips',
    subtitle: 'Prepare your skin for the changing season',
    type: 'article',
    imageUrl: '/images/featured/fall-skincare.jpg',
    link: '/blog/fall-skincare-tips',
    status: 'scheduled',
    startDate: '2025-09-01T00:00:00',
    endDate: '2025-11-30T23:59:59',
    category: 'skincare',
    position: 'homepage',
    priority: 1,
    views: 0,
    engagements: 0
  }
];

export const contentPositions = [
  { id: 'homepage', name: 'Homepage' },
  { id: 'about', name: 'About Page' },
  { id: 'category', name: 'Category Pages' },
  { id: 'product', name: 'Product Pages' },
  { id: 'checkout', name: 'Checkout Page' }
];

export const contentTypes = [
  { id: 'article', name: 'Article' },
  { id: 'tutorial', name: 'Tutorial' },
  { id: 'video', name: 'Video' },
  { id: 'promotion', name: 'Promotion' },
  { id: 'testimonial', name: 'Testimonial' }
];
