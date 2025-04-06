import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { ThemeContext } from '../../../context/ThemeContext.jsx';
import heroImage from '../../../assets/images/hero-image.webp';

function Hero() {
    const { colors } = useContext(ThemeContext);

    return (
        <section
            className={`relative min-h-[70vh] md:min-h-[80vh] lg:min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center ${colors.background}`}
            style={{ backgroundImage: `url(${heroImage})` }}
        >
            <div className={`absolute inset-0 ${colors.sectionBg}/70`}></div>
            <div className="container mx-auto px-4 md:px-6 lg:px-8 text-center relative z-10">
                <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 tracking-tight ${colors.textPrimary}`}>
                    Discover Your Perfect Skincare
                </h1>
                <p className={`text-lg md:text-xl lg:text-2xl mb-6 md:mb-8 ${colors.textSecondary} max-w-2xl mx-auto`}>
                    Premium beauty products tailored for you.
                </p>
                <Link
                    to="/products"
                    className={`inline-block px-6 py-3 md:px-8 md:py-4 rounded-full font-semibold text-base md:text-lg transition-transform duration-300 transform hover:scale-105 ${colors.buttonBg} ${colors.buttonText} ${colors.buttonHoverBg}`}
                >
                    Shop Now
                </Link>
            </div>
            <div className={`absolute inset-0 -z-20 opacity-10 ${colors.accent} blur-3xl rounded-full w-1/2 h-1/2 top-1/4 left-1/4`}></div>
        </section>
    );
}

export default Hero;