import React, { useState } from 'react';
import FilterBar from '../components/FilterBar';
import ProductCard from '../components/ProductCard';
import ReviewSection from '../components/ReviewSection';
import { useCart } from '../../../context/CartContext';

const mockProducts = [
    { id: 1, name: 'Hydrating Moisturizer', price: 29.99, image: '/images/skincare/moisturizer.jpg', rating: 4.5, category: 'Moisturizers' },
    { id: 2, name: 'Cleansing Foam', price: 19.99, image: '/images/skincare/cleanser.jpg', rating: 4.2, category: 'Cleansers' },
    { id: 3, name: 'SPF 50 Sunscreen', price: 24.99, image: '/images/skincare/sunscreen.jpg', rating: 4.7, category: 'Sunscreens' },
    { id: 4, name: 'Anti-Aging Serum', price: 49.99, image: '/images/skincare/serum.jpg', rating: 4.8, category: 'Serums' },
];

function Skincare() {
    const { addToCart } = useCart();
    const [filters, setFilters] = useState({ category: 'All', sort: 'default' });

    const filteredProducts = mockProducts
        .filter((product) => filters.category === 'All' || product.category === filters.category)
        .sort((a, b) => {
            if (filters.sort === 'price-low') return a.price - b.price;
            if (filters.sort === 'price-high') return b.price - a.price;
            if (filters.sort === 'rating') return b.rating - a.rating;
            return 0;
        });

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Skincare</h1>
                <FilterBar
                    categories={['All', 'Moisturizers', 'Cleansers', 'Sunscreens', 'Serums']}
                    onFilterChange={setFilters}
                    currentFilters={filters}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredProducts.map((product) => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            onAddToCart={() => addToCart(product)}
                        />
                    ))}
                </div>
                <ReviewSection />
            </div>
        </div>
    );
}

export default Skincare;