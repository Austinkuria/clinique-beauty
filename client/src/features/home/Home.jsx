import React, { useContext } from 'react';
import { ThemeContext } from '../../context/ThemeContext.jsx';
import Hero from './components/Hero.jsx';
import FeaturedProducts from './components/FeaturedProducts.jsx';

function Home() {
    const { theme } = useContext(ThemeContext);

    return (
        <div className="min-h-screen">
            <Hero />
            <FeaturedProducts />
        </div>
    );
}

export default Home;
