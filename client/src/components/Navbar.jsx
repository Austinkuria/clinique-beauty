import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { ThemeContext } from '../context/ThemeContext.jsx';
import { HomeIcon, ShoppingCartIcon, UserIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

function Navbar() {
    const { colors, toggleTheme } = useContext(ThemeContext);
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className={`sticky top-0 z-50 ${colors.navbarBg} ${colors.shadow} transition-all duration-300`}>
            <div className="container mx-auto px-4 md:px-6 lg:px-8 py-4 flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className={`text-2xl md:text-3xl font-bold ${colors.textPrimary} flex items-center gap-2`}>
                    <HomeIcon className="w-6 h-6" /> Clinique Beauty
                </Link>

                {/* Desktop Menu - Horizontal Alignment */}
                <div className="hidden md:flex items-center space-x-6">
                    <Link to="/products" className={`${colors.textSecondary} ${colors.textHover} transition-colors duration-200`}>
                        Products
                    </Link>
                    <Link to="/cart" className={`${colors.textSecondary} ${colors.textHover} flex items-center gap-1 transition-colors duration-200`}>
                        <ShoppingCartIcon className="w-5 h-5" /> Cart
                    </Link>
                    <Link to="/profile" className={`${colors.textSecondary} ${colors.textHover} flex items-center gap-1 transition-colors duration-200`}>
                        <UserIcon className="w-5 h-5" /> Profile
                    </Link>
                    <Link to="/login" className={`${colors.textSecondary} ${colors.textHover} transition-colors duration-200`}>
                        Login
                    </Link>
                    <button
                        onClick={toggleTheme}
                        className={`${colors.buttonBg} ${colors.buttonText} ${colors.buttonHoverBg} px-4 py-2 rounded-full text-sm font-semibold transition-transform duration-200 hover:scale-105`}
                    >
                        Toggle Theme
                    </button>
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    className="md:hidden text-2xl focus:outline-none"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? <XMarkIcon className={`${colors.textPrimary} w-6 h-6`} /> : <Bars3Icon className={`${colors.textPrimary} w-6 h-6`} />}
                </button>
            </div>

            {/* Mobile Menu - Vertical Alignment */}
            <div
                className={`md:hidden ${isOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'} ${colors.navbarBg} overflow-hidden transition-all duration-300 ease-in-out`}
            >
                <div className="flex flex-col items-center space-y-4 py-4">
                    <Link to="/products" className={`${colors.textSecondary} ${colors.textHover}`} onClick={() => setIsOpen(false)}>
                        Products
                    </Link>
                    <Link to="/cart" className={`${colors.textSecondary} ${colors.textHover} flex items-center gap-1`} onClick={() => setIsOpen(false)}>
                        <ShoppingCartIcon className="w-5 h-5" /> Cart
                    </Link>
                    <Link to="/profile" className={`${colors.textSecondary} ${colors.textHover} flex items-center gap-1`} onClick={() => setIsOpen(false)}>
                        <UserIcon className="w-5 h-5" /> Profile
                    </Link>
                    <Link to="/login" className={`${colors.textSecondary} ${colors.textHover}`} onClick={() => setIsOpen(false)}>
                        Login
                    </Link>
                    <button
                        onClick={() => { toggleTheme(); setIsOpen(false); }}
                        className={`${colors.buttonBg} ${colors.buttonText} ${colors.buttonHoverBg} px-4 py-2 rounded-full text-sm font-semibold transition-transform duration-200 hover:scale-105`}
                    >
                        Toggle Theme
                    </button>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;