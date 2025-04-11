import React, { useState } from 'react';
import FilterBar from '../components/FilterBar';
import ProductCard from '../components/ProductCard';
import ReviewSection from '../components/ReviewSection';
import { useCart } from '../../../context/CartContext';

const mockProducts = [
    { id: 5, name: 'Matte Lipstick', price: 15.99, image: '/images/makeup/lipstick.jpg', rating: 4.3, category: 'Lipstick' },
    { id: 6, name: 'Liquid Foundation', price: 29.99, image: '/images/makeup/foundation.jpg', rating: 4.6, category: 'Foundation' },
    { id: 7, name: 'Mascara', price: 12.99, image: '/images/makeup/mascara.jpg', rating: 4.4, category: 'Mascara' },
    { id: 8, name: 'Eyeshadow Palette', price: 39.99, image: '/images/makeup/eyeshadow.jpg', rating: 4.7, category: 'Eyeshadow' },
];

function Makeup() {
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
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Makeup</h1>
                <FilterBar
                    categories={['All', 'Lipstick', 'Foundation', 'Mascara', 'Eyeshadow']}
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

export default Makeup;