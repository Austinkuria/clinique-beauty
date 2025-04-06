import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { ThemeContext } from '../context/ThemeContext.jsx';
import { HomeIcon, ShoppingCartIcon, UserIcon, Bars3Icon, XMarkIcon, SunIcon, MoonIcon } from '@heroicons/react/24/outline';

function Navbar() {
    const { colors, toggleTheme, theme } = useContext(ThemeContext);
    const [isOpen, setIsOpen] = useState(false);

    // Define better contrast colors for navbar links
    const linkClass = theme === 'dark' 
        ? "text-white hover:text-pink-300 transition-colors duration-200 font-medium" 
        : "text-gray-800 hover:text-pink-600 transition-colors duration-200 font-medium";

    return (
        <nav className={`sticky top-0 z-50 ${colors.navbarBg} ${colors.shadow} transition-all duration-300 w-full`}>
            {/* Removed container mx-auto and reduced padding to eliminate space on both sides */}
            <div className="flex items-center justify-between px-2 py-4 w-full">
                {/* Logo - removed left padding */}
                <Link to="/" className={`text-2xl md:text-3xl font-bold ${colors.navbarTextPrimary} flex items-center gap-2`}>
                    <HomeIcon className="w-6 h-6" /> Clinique Beauty
                </Link>

                {/* Desktop Menu - Adjusted spacing and removed unwanted margin */}
                <div className="hidden lg:flex items-center" style={{ display: 'flex', '@media (max-width: 768px)': { display: 'none' } }}>
                    <div className="flex items-center space-x-6 mr-6">
                        <Link to="/products"
                            className={linkClass}
                            style={{ color: theme === 'dark' ? '#ffffff' : 'inherit' }}>
                            Products
                        </Link>
                        <Link to="/cart"
                            className={`${linkClass} flex items-center gap-1`}
                            style={{ color: theme === 'dark' ? '#ffffff' : 'inherit' }}>
                            <ShoppingCartIcon className="w-5 h-5" /> Cart
                        </Link>
                        <Link to="/profile"
                            className={`${linkClass} flex items-center gap-1`}
                            style={{ color: theme === 'dark' ? '#ffffff' : 'inherit' }}>
                            <UserIcon className="w-5 h-5" /> Profile
                        </Link>
                        <Link to="auth/login"
                            className={linkClass}
                            style={{ color: theme === 'dark' ? '#ffffff' : 'inherit' }}>
                            Login
                        </Link>
                    </div>
                    <button
                        onClick={toggleTheme}
                        className={`${colors.buttonBg} ${colors.buttonText} ${colors.buttonHoverBg} p-2 rounded-full transition-transform duration-200 hover:scale-105 flex items-center justify-center`}
                        aria-label="Toggle theme"
                        title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
                    >
                        {theme === 'light' ? 
                            <MoonIcon className="w-5 h-5" /> : 
                            <SunIcon className="w-5 h-5" />
                        }
                    </button>
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    className="lg:hidden text-2xl focus:outline-none"
                    onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? <XMarkIcon className={`${colors.navbarTextPrimary} w-6 h-6`} /> : <Bars3Icon className={`${colors.navbarTextPrimary} w-6 h-6`} />}
                </button>
            </div>

            {/* Mobile Menu - Vertical Alignment */}
            <div
                className={`md:hidden ${isOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'} ${colors.navbarBg} overflow-hidden transition-all duration-300 ease-in-out`}
            >
                <div className="flex flex-col items-center space-y-4 py-4">
                    <Link to="/products" 
                        className={linkClass}
                        onClick={() => setIsOpen(false)}
                        style={{ color: theme === 'dark' ? '#ffffff' : 'inherit' }}>
                        Products
                    </Link>
                    <Link to="/cart" 
                        className={`${linkClass} flex items-center gap-1`}
                        onClick={() => setIsOpen(false)}
                        style={{ color: theme === 'dark' ? '#ffffff' : 'inherit' }}>
                        <ShoppingCartIcon className="w-5 h-5" /> Cart
                    </Link>
                    <Link to="/profile" 
                        className={`${linkClass} flex items-center gap-1`}
                        onClick={() => setIsOpen(false)}
                        style={{ color: theme === 'dark' ? '#ffffff' : 'inherit' }}>
                        <UserIcon className="w-5 h-5" /> Profile
                    </Link>
                    <Link to="/login" 
                        className={linkClass}
                        onClick={() => setIsOpen(false)}
                        style={{ color: theme === 'dark' ? '#ffffff' : 'inherit' }}>
                        Login
                    </Link>
                    <button
                        onClick={() => { toggleTheme(); setIsOpen(false); }}
                        className={`${colors.buttonBg} ${colors.buttonText} ${colors.buttonHoverBg} p-2 rounded-full transition-transform duration-200 hover:scale-105 flex items-center justify-center`}
                        aria-label="Toggle theme"
                        title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
                    >
                        {theme === 'light' ? 
                            <MoonIcon className="w-5 h-5" /> : 
                            <SunIcon className="w-5 h-5" />
                        }
                    </button>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;