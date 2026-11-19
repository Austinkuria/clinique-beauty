// client/src/data/mockProducts.js
// Centralised product catalog with verified high-resolution CDN images

const mockProducts = [
    // Skincare Products
    {
        id: 1,
        name: 'Hydrating Moisturizer',
        price: 29.99,
        image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80',
        additionalImages: [
            'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1608248597359-5484860b7646?auto=format&fit=crop&w=800&q=80'
        ],
        rating: 4.5,
        category: 'Skincare',
        subcategory: 'Moisturizer',
        stock: 50,
        description: 'A lightweight, oil-free formula that delivers 24-hour hydration, leaving skin smooth and supple.',
        benefits: ['Oil-free formula', '24-hour hydration', 'Suitable for all skin types'],
        ingredients: ['Hyaluronic Acid', 'Glycerin', 'Aloe Vera', 'Vitamin E']
    },
    {
        id: 2,
        name: 'Cleansing Foam',
        price: 19.99,
        image: 'https://images.unsplash.com/photo-1556228852-80b6e5eeff06?auto=format&fit=crop&w=800&q=80',
        additionalImages: [
            'https://images.unsplash.com/photo-1556228722-d0b503022e37?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&w=800&q=80'
        ],
        rating: 4.2,
        category: 'Skincare',
        subcategory: 'Cleanser',
        stock: 35,
        description: 'Gently removes makeup, dirt, and impurities without stripping skin of essential moisture.',
        benefits: ['Gentle formula', 'Removes makeup and impurities', 'pH balanced'],
        ingredients: ['Glycerin', 'Sodium Hyaluronate', 'Chamomile Extract']
    },
    {
        id: 3,
        name: 'SPF 50 Sunscreen',
        price: 24.99,
        image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=800&q=80',
        additionalImages: [
            'https://images.unsplash.com/photo-1556228724-4da94a73229b?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80'
        ],
        rating: 4.7,
        category: 'Skincare',
        subcategory: 'Sunscreen',
        stock: 40,
        description: 'Broad spectrum SPF 50 protection against harmful UVA/UVB rays in a lightweight, non-greasy formula.',
        benefits: ['SPF 50 Protection', 'Water-resistant', 'Non-comedogenic'],
        ingredients: ['Zinc Oxide', 'Titanium Dioxide', 'Vitamin E', 'Green Tea Extract']
    },
    {
        id: 4,
        name: 'Anti-Aging Serum',
        price: 49.99,
        image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80',
        additionalImages: [
            'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1608248597359-5484860b7646?auto=format&fit=crop&w=800&q=80'
        ],
        rating: 4.8,
        category: 'Skincare',
        subcategory: 'Serum',
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
        image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=800&q=80',
        additionalImages: [
            'https://images.unsplash.com/photo-1625093742435-6fa192b6fb10?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1599732486930-b9986b6276b9?auto=format&fit=crop&w=800&q=80'
        ],
        rating: 4.3,
        category: 'Makeup',
        subcategory: 'Lipstick',
        stock: 60,
        description: "Long-lasting, highly pigmented matte lipstick that does not dry out lips.",
        benefits: ['Long-wearing formula', 'Comfortable matte finish', 'Highly pigmented'],
        ingredients: ['Shea Butter', 'Vitamin E', 'Jojoba Oil'],
        shades: [
            { name: 'Classic Red', color: '#C0392B' },
            { name: 'Nude Pink', color: '#E5B4B4' },
            { name: 'Deep Plum', color: '#6C3483' },
            { name: 'Coral Kiss', color: '#F39C12' },
            { name: 'Berry Bold', color: '#9B59B6' }
        ]
    },
    {
        id: 6,
        name: 'Liquid Foundation',
        price: 29.99,
        image: 'https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?auto=format&fit=crop&w=800&q=80',
        additionalImages: [
            'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80'
        ],
        rating: 4.6,
        category: 'Makeup',
        subcategory: 'Foundation',
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
            { name: 'Deep Mocha', color: '#A07C5E' }
        ]
    },
    {
        id: 7,
        name: 'Mascara',
        price: 12.99,
        image: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=800&q=80',
        additionalImages: [
            'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80'
        ],
        rating: 4.4,
        category: 'Makeup',
        subcategory: 'Mascara',
        stock: 75,
        description: 'Volumizing and lengthening mascara that creates dramatic lashes without clumping.',
        benefits: ['Volumizing and lengthening', 'Smudge-proof', 'Easy to remove'],
        ingredients: ['Panthenol', 'Keratin', 'Vitamin B5']
    },
    {
        id: 8,
        name: 'Eyeshadow Palette',
        price: 39.99,
        image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=800&q=80',
        additionalImages: [
            'https://images.unsplash.com/photo-1583241800698-e8ab01830a07?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1503236823255-94609f598e71?auto=format&fit=crop&w=800&q=80'
        ],
        rating: 4.7,
        category: 'Makeup',
        subcategory: 'Eyeshadow',
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
        image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=800&q=80',
        additionalImages: [
            'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80'
        ],
        rating: 4.8,
        category: 'Fragrance',
        subcategory: 'Eau de Parfum',
        stock: 15,
        description: 'A sophisticated floral scent with notes of rose, jasmine, and lily of the valley.',
        benefits: ['Long-lasting scent', 'Elegant glass bottle', 'Suitable for day and evening'],
        notes: ['Top: Bergamot, Pear', 'Middle: Rose, Jasmine', 'Base: Sandalwood, Vanilla']
    },
    {
        id: 10,
        name: 'Citrus Mist',
        price: 39.99,
        image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=80',
        additionalImages: [
            'https://images.unsplash.com/photo-1615397349754-cfa2066a298e?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=800&q=80'
        ],
        rating: 4.5,
        category: 'Fragrance',
        subcategory: 'Eau de Toilette',
        stock: 22,
        description: 'Refreshing and invigorating citrus scent perfect for everyday wear.',
        benefits: ['Refreshing and invigorating', 'Perfect for everyday', 'Travel-friendly size'],
        notes: ['Top: Lemon, Grapefruit', 'Middle: Orange Blossom', 'Base: Amber, Musk']
    },
    {
        id: 11,
        name: 'Woody Essence',
        price: 69.99,
        image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80',
        additionalImages: [
            'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=800&q=80'
        ],
        rating: 4.9,
        category: 'Fragrance',
        subcategory: 'Eau de Parfum',
        stock: 18,
        description: 'An elegant woody fragrance with deep, warm notes for a bold statement.',
        benefits: ['Rich, warm scent', 'Long-lasting formula', 'Signature scent potential'],
        notes: ['Top: Cardamom, Pepper', 'Middle: Cedarwood, Vetiver', 'Base: Patchouli, Amber']
    },
    {
        id: 12,
        name: 'Fresh Breeze',
        price: 29.99,
        image: 'https://images.unsplash.com/photo-1615397349754-cfa2066a298e?auto=format&fit=crop&w=800&q=80',
        additionalImages: [
            'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80'
        ],
        rating: 4.3,
        category: 'Fragrance',
        subcategory: 'Body Mist',
        stock: 30,
        description: 'Light and airy body mist with hints of ocean breeze and fresh linen.',
        benefits: ['Light and refreshing', 'Perfect for summer', 'Can be layered with other scents'],
        notes: ['Top: Sea Salt, Bergamot', 'Middle: Lavender, Cotton', 'Base: Light Musk']
    },

    // Hair Products
    {
        id: 13,
        name: 'Moisturizing Shampoo',
        price: 18.99,
        image: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=800&q=80',
        additionalImages: [
            'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80'
        ],
        rating: 4.6,
        category: 'Hair',
        subcategory: 'Shampoo',
        stock: 45,
        description: 'Hydrating shampoo that cleanses while adding moisture to dry, damaged hair.',
        benefits: ['Hydrates dry hair', 'Gentle cleansing', 'Adds shine'],
        ingredients: ['Argan Oil', 'Shea Butter', 'Keratin', 'Aloe Vera']
    },
    {
        id: 14,
        name: 'Repair Conditioner',
        price: 16.99,
        image: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=800&q=80',
        additionalImages: [
            'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80'
        ],
        rating: 4.5,
        category: 'Hair',
        subcategory: 'Conditioner',
        stock: 40,
        description: 'Deep conditioning treatment that repairs damaged hair and split ends.',
        benefits: ['Repairs damage', 'Prevents split ends', 'Detangles effectively'],
        ingredients: ['Keratin', 'Avocado Oil', 'Vitamin B5', 'Silk Proteins']
    },
    {
        id: 15,
        name: 'Curl Defining Cream',
        price: 22.99,
        image: 'https://images.unsplash.com/photo-1608248597359-5484860b7646?auto=format&fit=crop&w=800&q=80',
        additionalImages: [
            'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=800&q=80'
        ],
        rating: 4.7,
        category: 'Hair',
        subcategory: 'Styling',
        stock: 28,
        description: 'Defines and enhances natural curls while eliminating frizz and adding shine.',
        benefits: ['Defines curls', 'Controls frizz', 'No crunchy feel'],
        ingredients: ['Coconut Oil', 'Shea Butter', 'Jojoba Oil', 'Aloe Vera']
    },
    {
        id: 16,
        name: 'Hair Oil Treatment',
        price: 34.99,
        image: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&w=800&q=80',
        additionalImages: [
            'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=800&q=80'
        ],
        rating: 4.8,
        category: 'Hair',
        subcategory: 'Treatment',
        stock: 20,
        description: 'Lightweight oil that nourishes hair, adds shine, and tames frizz without weighing hair down.',
        benefits: ['Adds shine', 'Reduces frizz', 'Protects from heat damage'],
        ingredients: ['Argan Oil', 'Jojoba Oil', 'Marula Oil', 'Vitamin E']
    }
];

export default mockProducts;
