import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Banner from '../features/home/components/Banner';

function MainLayout() {
    return (
        <div className="flex flex-col min-h-screen">
            <Banner />
            <Navbar />
            <main className="flex-1">
                <Outlet />
            </main>
        </div>
    );
}

export default MainLayout;
