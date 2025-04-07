import React, { useContext } from 'react';
import { Outlet } from 'react-router-dom';
import { ThemeContext } from '../context/ThemeContext';
import Navbar from '../components/Navbar';
import Banner from '../features/home/components/Banner';

function MainLayout() {
    const { colors } = useContext(ThemeContext);

    return (
        <div className={`flex flex-col min-h-screen ${colors.background}`}>
            <Banner />
            <Navbar />
            <main className="flex-1">
                <Outlet />
            </main>
        </div>
    );
}

export default MainLayout;
