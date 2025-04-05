import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { ThemeContext } from '../../../context/ThemeContext.jsx';

function FeaturedProducts() {
    const { theme } = useContext(ThemeContext);
    const products = [{
        id: 1, name: 'Moisturizer',
        price: 29.99,
        image: '/assets/images/products/moisturizer.jpg'
    },
    {
        id: 2,
        name: 'Cleanser',
        price: 19.99,
        image: '/assets/images/products/cleanser.jpg'
    },
    {
        id: 3,
        name: 'Serum',
        price: 39.99,
        image: '/assets/images/products/serum.jpg'
    }];
    return (
        <section className={'py-16'}>
            <div className='container mx-auto px-4'>
                <h2 className='text-3xl font-bold text-center mb-8'>
                    Featured Products
                </h2>
                <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6'>
                    {products.map(product => (
                        <div key={product.id} className={'p-4 rounded-lg shadow-md'}>
                            <img src={product.image} alt={product.name} className='w-full h-48 object-cover rounded-lg mb-4' />
                            <h3 className='text-xl font-semibold'>{product.name}</h3>
                            <p className='text-lg mb-4'>${product.price}</p>
                            <Link to={`/products/${product.id}`} className={'inline-block px-4 py-2 rounded-full font-semibold transition'}>
                                View Product
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
export default FeaturedProducts;
