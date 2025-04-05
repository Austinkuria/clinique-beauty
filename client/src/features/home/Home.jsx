import React, { useContext } from 'react';
import { ThemeContext } from '../../context/ThemeContext.jsx';
import Hero from './components/Hero.jsx';
import FeaturedProducts from './components/FeaturedProducts.jsx';
import Banner from './components/Banner.jsx';

function Home() { const { theme } = useContext(ThemeContext); 
return (<div className="min-h-screen">
    <Hero /><FeaturedProducts /><Banner />
    </div>); 
    }
    export default Home;
