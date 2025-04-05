import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { ThemeContext } from '../../../context/ThemeContext.jsx';
import heroImage from '../../../assets/images/hero-image.webp';

function Hero() {
    const { theme } = useContext(ThemeContext);

    return (
        <section className="relative py-28 bg-gradient-to-br from-pink-50 to-white">
            <div className="container mx-auto px-4 text-center">
                <h1 className="text-5xl md:text-6xl font-bold mb-6 text-pink-600 leading-tight">
                    Discover Your Perfect Skincare
                </h1>
                <p className="text-xl md:text-2xl mb-8 text-gray-600 max-w-2xl mx-auto">
                    Premium beauty products tailored for you.
                </p>
                <Link
                    to="/products"
                    className="inline-block px-8 py-4 bg-pink-500 text-white rounded-full font-semibold hover:bg-pink-600 transform hover:scale-105 transition duration-300 shadow-md"
                >
                    Shop Now
                </Link>
                <div className="mt-12">
                    <img
                        src={heroImage}
                        alt="Hero"
                        className="w-full max-w-lg mx-auto rounded-2xl shadow-xl hover:shadow-2xl transition duration-300 object-cover"
                    />
                </div>
            </div>
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-pink-200 rounded-full opacity-20"></div>
                <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-pink-300 rounded-full opacity-20"></div>
            </div>
        </section>
    );
}

export default Hero;
