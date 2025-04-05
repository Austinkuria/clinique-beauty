import React, { useContext } from 'react'; 
import { Link } from 'react-router-dom'; 
import { ThemeContext } from '../../../context/ThemeContext.jsx'; 

function Banner() { 
    const { theme } = useContext(ThemeContext);
    
    return (<section className={'py-16'}>
        <div className='container mx-auto px-4 text-center text-white'>
            <h2 className='text-3xl font-bold mb-4'>Spring Sale - Up to 20% Off</h2>
            <p className='text-lg mb-6'>
                Limited time offer on your favorite skincare essentials.
            </p>
            <Link to='/products' className='inline-block px-6 py-3 bg-white text-pink-600 rounded-full font-semibold hover:bg-gray-100 transition'>
                Shop the Sale
            </Link>
        </div>
    </section>);
} 
export default Banner;
