import React, { useContext } from 'react';
import { Outlet } from 'react-router-dom';
import { ThemeContext } from '../context/ThemeContext';
import Navbar from '../components/Navbar';
import Banner from '../features/home/components/Banner';

function MainLayout() {
    const { theme } = useContext(ThemeContext);
    const bgClass = theme === 'light' ? 'theme-bg-light' : 'theme-bg-dark';

    return (
        <div className={`flex flex-col min-h-screen ${bgClass}`}>
            <Banner />
            <Navbar />
            <main className="flex-1">
                <Outlet />
            </main>
        </div>
    );
}

export default MainLayout;
