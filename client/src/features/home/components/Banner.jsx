import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { ThemeContext } from '../../../context/ThemeContext.jsx';
import { SparklesIcon, XMarkIcon } from '@heroicons/react/24/outline';

function Banner() {
    const { colors } = useContext(ThemeContext);
    const [isVisible, setIsVisible] = useState(true);

    if (!isVisible) return null;

    return (
        <div className={`w-full ${colors.accent} py-3 transition-all duration-300 ease-in-out z-10 shadow-md`}>
            {/* used px-2 for minimal edge spacing */}
            <div className="flex items-center justify-between px-2">
                {/* Center Content */}
                <div className="flex items-center justify-center gap-3">
                    <SparklesIcon className={`w-5 h-5 md:w-6 md:h-6 ${colors.buttonText}`} />
                    <p className={`${colors.buttonText} text-sm md:text-base lg:text-lg font-medium tracking-tight`}>
                        Special Offer: Get <span className="font-bold">20% off</span> your first purchase with code <span className="font-bold italic">BEAUTY20</span>
                    </p>
                    <Link
                        to="/products"
                        className={`${colors.buttonBg} ${colors.buttonText} ${colors.buttonHoverBg} px-4 py-1.5 md:px-6 md:py-2 rounded-full text-sm md:text-base font-semibold transition-transform duration-200 hover:scale-105`}
                    >
                        Shop Now
                    </Link>
                </div>

                {/* Close Button */}
                <button
                    onClick={() => setIsVisible(false)}
                    className={`${colors.buttonText} hover:opacity-75 transition-opacity duration-200`}
                    aria-label="Close banner"
                >
                    <XMarkIcon className="w-5 h-5 md:w-6 md:h-6" />
                </button>
            </div>
        </div>
    );
}

export default Banner;