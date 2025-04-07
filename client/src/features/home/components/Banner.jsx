import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { ThemeContext } from '../../../context/ThemeContext';
import { SparklesIcon, XMarkIcon } from '@heroicons/react/24/outline';

function Banner() {
    const { colors } = useContext(ThemeContext);
    const [isVisible, setIsVisible] = useState(true);

    if (!isVisible) return null;

    return (
        <div style={{ backgroundColor: '#ec4899' }} className="w-full py-2 text-white shadow-sm">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between">
                    {/* Desktop Banner Content */}
                    <div className="hidden md:flex items-center justify-between flex-1">
                        <div className="flex items-center">
                            <SparklesIcon className="w-4 h-4 text-white mr-2" />
                            <p className="text-white text-sm font-medium">
                                Special Offer: Get <span className="font-bold underline decoration-dotted">20% off</span> your first purchase with code <span className="font-bold bg-white bg-opacity-20 px-1.5 py-0.5 rounded">BEAUTY20</span>
                            </p>
                        </div>
                        <Link
                            to="/products"
                            className="bg-white text-pink-600 px-5 py-1 rounded-full text-xs font-semibold transition hover:bg-gray-100 hover:text-pink-700 shadow-sm"
                        >
                            Shop Now
                        </Link>
                    </div>

                    {/* Mobile Banner Content */}
                    <div className="flex md:hidden flex-row items-center justify-between w-full">
                        <div className="flex items-center">
                            <SparklesIcon className="w-3.5 h-3.5 text-white mr-1.5 flex-shrink-0" />
                            <p className="text-white text-xs font-medium">
                                20% off: <span className="font-bold bg-white bg-opacity-20 px-1 py-0.5 rounded text-xs">BEAUTY20</span>
                            </p>
                        </div>
                        <Link
                            to="/products"
                            className="bg-white text-pink-600 px-3 py-0.5 rounded-full text-xs font-semibold ml-2 shadow-sm hover:bg-gray-100"
                        >
                            Shop Now
                        </Link>
                    </div>

                    {/* Close Button */}
                    <button
                        onClick={() => setIsVisible(false)}
                        className="text-white bg-pink-600 hover:bg-pink-700 p-0.5 rounded-full ml-2 flex items-center justify-center"
                        aria-label="Close banner"
                    >
                        <XMarkIcon className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Banner;