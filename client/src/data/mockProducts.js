// Centralized mock product data for all product categories

const mockProducts = [
    // Skincare Products
    {
        id: 1,
        name: 'Hydrating Moisturizer',
        price: 29.99,
        image: '/images/skincare/moisturizer.webp',
        additionalImages: [
            '/images/skincare/moisturizer-angle.jpg',
            '/images/skincare/moisturizer-texture.jpg'
        ],
        rating: 4.5,
        category: 'Skincare', // Main category
        subcategory: 'Moisturizer', // Specific type
        stock: 50,
        description: 'A lightweight, oil-free formula that delivers 24-hour hydration, leaving skin smooth and supple.',
        benefits: ['Oil-free formula', '24-hour hydration', 'Suitable for all skin types'],
        ingredients: ['Hyaluronic Acid', 'Glycerin', 'Aloe Vera', 'Vitamin E']
    },
    {
        id: 2,
        name: 'Cleansing Foam',
        price: 19.99,
        image: '/images/skincare/cleanser.jpg',
        additionalImages: [
            '/images/skincare/cleanser-angle.jpg',
            '/images/skincare/cleanser-texture.jpg'
        ],
        rating: 4.2,
        category: 'Skincare', // Main category
        subcategory: 'Cleanser', // Specific type
        stock: 35,
        description: 'Gently removes makeup, dirt, and impurities without stripping skin of essential moisture.',
        benefits: ['Gentle formula', 'Removes makeup and impurities', 'pH balanced'],
        ingredients: ['Glycerin', 'Sodium Hyaluronate', 'Chamomile Extract']
    },
    {
        id: 3,
        name: 'SPF 50 Sunscreen',
        price: 24.99,
        image: '/images/skincare/sunscreen.jpg',
        additionalImages: [
            '/images/skincare/sunscreen-angle.jpg',
            '/images/skincare/sunscreen-texture.jpg'
        ],
        rating: 4.7,
        category: 'Skincare', // Main category
        subcategory: 'Sunscreen', // Specific type
        stock: 40,
        description: 'Broad spectrum SPF 50 protection against harmful UVA/UVB rays in a lightweight, non-greasy formula.',
        benefits: ['SPF 50 Protection', 'Water-resistant', 'Non-comedogenic'],
        ingredients: ['Zinc Oxide', 'Titanium Dioxide', 'Vitamin E', 'Green Tea Extract']
    },
    {
        id: 4,
        name: 'Anti-Aging Serum',
        price: 49.99,
        image: '/images/skincare/serum.webp',
        additionalImages: [
            '/images/skincare/serum-angle.jpg',
            '/images/skincare/serum-texture.jpg'
        ],
        rating: 4.8,
        category: 'Skincare', // Main category
        subcategory: 'Serum', // Specific type
        stock: 25,
        description: 'Targets fine lines and wrinkles with advanced peptides and antioxidants for visibly younger-looking skin.',
        benefits: ['Reduces fine lines', 'Improves skin elasticity', 'Brightens complexion'],
        ingredients: ['Peptides', 'Niacinamide', 'Vitamin C', 'Hyaluronic Acid']
    },

    // Makeup Products
    {
        id: 5,
        name: 'Matte Lipstick',
        price: 15.99,
        image: '/images/makeup/lipstick.jpg',
        additionalImages: [
            '/images/makeup/lipstick-angle.jpg',
            '/images/makeup/lipstick-texture.jpg'
        ],
        rating: 4.3,
        category: 'Makeup', // Main category
        subcategory: 'Lipstick', // Specific type
        stock: 60,
        description: "Long-lasting, highly pigmented matte lipstick that doesn't dry out lips.",
        benefits: ['Long-wearing formula', 'Comfortable matte finish', 'Highly pigmented'],
        ingredients: ['Shea Butter', 'Vitamin E', 'Jojoba Oil'],
        shades: [
            { name: 'Classic Red', color: '#C0392B' },
            { name: 'Nude Pink', color: '#E5B4B4' },
            { name: 'Deep Plum', color: '#6C3483' },
            { name: 'Coral Kiss', color: '#F39C12' },
            { name: 'Berry Bold', color: '#9B59B6' },
        ]
    },
    {
        id: 6,
        name: 'Liquid Foundation',
        price: 29.99,
        image: '/images/makeup/foundation.jpg',
        additionalImages: [
            '/images/makeup/foundation-angle.jpg',
            '/images/makeup/foundation-texture.jpg'
        ],
        rating: 4.6,
        category: 'Makeup', // Main category
        subcategory: 'Foundation', // Specific type
        stock: 30,
        description: 'Medium to full coverage foundation with a natural finish that lasts all day.',
        benefits: ['Medium to full coverage', '24-hour wear', 'Natural finish'],
        ingredients: ['Hyaluronic Acid', 'Vitamin E', 'SPF 20'],
        shades: [
            { name: 'Fair Ivory', color: '#F5E1D3' },
            { name: 'Light Beige', color: '#F3D9C6' },
            { name: 'Natural Buff', color: '#F1D4AF' },
            { name: 'Medium Sand', color: '#E6C3A8' },
            { name: 'Golden Tan', color: '#DDAE8A' },
            { name: 'Deep Mocha', color: '#A07C5E' },
        ]
    },
    {
        id: 7,
        name: 'Mascara',
        price: 12.99,
        image: '/images/makeup/mascara.jpg',
        additionalImages: [
            '/images/makeup/mascara-angle.jpg',
            '/images/makeup/mascara-texture.jpg'
        ],
        rating: 4.4,
        category: 'Makeup', // Main category
        subcategory: 'Mascara', // Specific type
        stock: 75,
        description: 'Volumizing and lengthening mascara that creates dramatic lashes without clumping.',
        benefits: ['Volumizing & lengthening', 'Smudge-proof', 'Easy to remove'],
        ingredients: ['Panthenol', 'Keratin', 'Vitamin B5']
    },
    {
        id: 8,
        name: 'Eyeshadow Palette',
        price: 39.99,
        image: '/images/makeup/eyeshadow.jpg',
        additionalImages: [
            '/images/makeup/eyeshadow-angle.jpg',
            '/images/makeup/eyeshadow-texture.jpg'
        ],
        rating: 4.7,
        category: 'Makeup', // Main category
        subcategory: 'Eyeshadow', // Specific type
        stock: 20,
        description: 'Versatile palette with 12 highly pigmented shades in matte and shimmer finishes.',
        benefits: ['12 versatile shades', 'Blend easily', 'Long-lasting wear'],
        ingredients: ['Mica', 'Silica', 'Vitamin E'],
        paletteTheme: 'Neutral Tones'
    },

    // Fragrance Products
    {
        id: 9,
        name: 'Floral Eau de Parfum',
        price: 59.99,
        image: '/images/fragrance/floral.jpg',
        additionalImages: [
            '/images/fragrance/floral-angle.jpg',
            '/images/fragrance/floral-bottle.jpg'
        ],
        rating: 4.8,
        category: 'Fragrance', // Main category
        subcategory: 'Eau de Parfum', // Specific type
        stock: 15,
        description: 'A sophisticated floral scent with notes of rose, jasmine, and lily of the valley.',
        benefits: ['Long-lasting scent', 'Elegant glass bottle', 'Suitable for day and evening'],
        notes: ['Top: Bergamot, Pear', 'Middle: Rose, Jasmine', 'Base: Sandalwood, Vanilla']
    },
    {
        id: 10,
        name: 'Citrus Mist',
        price: 39.99,
        image: '/images/fragrance/citrus.jpg',
        additionalImages: [
            '/images/fragrance/citrus-angle.jpg',
            '/images/fragrance/citrus-bottle.jpg'
        ],
        rating: 4.5,
        category: 'Fragrance', // Main category
        subcategory: 'Eau de Toilette', // Specific type
        stock: 22,
        description: 'Refreshing and invigorating citrus scent perfect for everyday wear.',
        benefits: ['Refreshing & invigorating', 'Perfect for everyday', 'Travel-friendly size'],
        notes: ['Top: Lemon, Grapefruit', 'Middle: Orange Blossom', 'Base: Amber, Musk']
    },
    {
        id: 11,
        name: 'Woody Essence',
        price: 69.99,
        image: '/images/fragrance/woody.jpg',
        additionalImages: [
            '/images/fragrance/woody-angle.jpg',
            '/images/fragrance/woody-bottle.jpg'
        ],
        rating: 4.9,
        category: 'Fragrance', // Main category
        subcategory: 'Eau de Parfum', // Specific type
        stock: 18,
        description: 'An elegant woody fragrance with deep, warm notes for a bold statement.',
        benefits: ['Rich, warm scent', 'Long-lasting formula', 'Signature scent potential'],
        notes: ['Top: Cardamom, Pepper', 'Middle: Cedarwood, Vetiver', 'Base: Patchouli, Amber']
    },
    {
        id: 12,
        name: 'Fresh Breeze',
        price: 29.99,
        image: '/images/fragrance/breeze.jpg',
        additionalImages: [
            '/images/fragrance/breeze-angle.jpg',
            '/images/fragrance/breeze-bottle.jpg'
        ],
        rating: 4.3,
        category: 'Fragrance', // Main category
        subcategory: 'Body Mist', // Specific type
        stock: 30,
        description: 'Light and airy body mist with hints of ocean breeze and fresh linen.',
        benefits: ['Light & refreshing', 'Perfect for summer', 'Can be layered with other scents'],
        notes: ['Top: Sea Salt, Bergamot', 'Middle: Lavender, Cotton', 'Base: Light Musk']
    },

    // Hair Products
    {
        id: 13,
        name: 'Moisturizing Shampoo',
        price: 18.99,
        image: '/images/hair/shampoo.jpg',
        additionalImages: [
            '/images/hair/shampoo-angle.jpg',
            '/images/hair/shampoo-texture.jpg'
        ],
        rating: 4.6,
        category: 'Hair', // Main category
        subcategory: 'Shampoo', // Specific type
        stock: 45,
        description: 'Hydrating shampoo that cleanses while adding moisture to dry, damaged hair.',
        benefits: ['Hydrates dry hair', 'Gentle cleansing', 'Adds shine'],
        ingredients: ['Argan Oil', 'Shea Butter', 'Keratin', 'Aloe Vera']
    },
    {
        id: 14,
        name: 'Repair Conditioner',
        price: 16.99,
        image: '/images/hair/conditioner.jpg',
        additionalImages: [
            '/images/hair/conditioner-angle.jpg',
            '/images/hair/conditioner-texture.jpg'
        ],
        rating: 4.5,
        category: 'Hair', // Main category
        subcategory: 'Conditioner', // Specific type
        stock: 40,
        description: 'Deep conditioning treatment that repairs damaged hair and split ends.',
        benefits: ['Repairs damage', 'Prevents split ends', 'Detangles effectively'],
        ingredients: ['Keratin', 'Avocado Oil', 'Vitamin B5', 'Silk Proteins']
    },
    {
        id: 15,
        name: 'Curl Defining Cream',
        price: 22.99,
        image: '/images/hair/styling-cream.jpg',
        additionalImages: [
            '/images/hair/styling-cream-angle.jpg',
            '/images/hair/styling-cream-texture.jpg'
        ],
        rating: 4.7,
        category: 'Hair', // Main category
        subcategory: 'Styling', // Specific type
        stock: 28,
        description: 'Defines and enhances natural curls while eliminating frizz and adding shine.',
        benefits: ['Defines curls', 'Controls frizz', 'No crunchy feel'],
        ingredients: ['Coconut Oil', 'Shea Butter', 'Jojoba Oil', 'Aloe Vera']
    },
    {
        id: 16,
        name: 'Hair Oil Treatment',
        price: 34.99,
        image: '/images/hair/oil.jpg',
        additionalImages: [
            '/images/hair/oil-angle.jpg',
            '/images/hair/oil-texture.jpg'
        ],
        rating: 4.8,
        category: 'Hair', // Main category
        subcategory: 'Treatment', // Specific type
        stock: 20,
        description: 'Lightweight oil that nourishes hair, adds shine, and tames frizz without weighing hair down.',
        benefits: ['Adds shine', 'Reduces frizz', 'Protects from heat damage'],
        ingredients: ['Argan Oil', 'Jojoba Oil', 'Marula Oil', 'Vitamin E']
    }
];

export default mockProducts;
