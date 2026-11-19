// client/src/context/CategoryContext.jsx
// Centralised dynamic category context ensuring single source of truth for Navbar, Sidebar, and Filters

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getApiUrl } from '../config/env';

const CategoryContext = createContext({
    categories: [],
    loading: false,
    refreshCategories: () => {}
});

const DEFAULT_CATEGORIES = [
    { id: 1, name: 'Skincare', slug: 'skincare' },
    { id: 2, name: 'Makeup', slug: 'makeup' },
    { id: 3, name: 'Fragrance', slug: 'fragrance' },
    { id: 4, name: 'Hair', slug: 'hair' },
    { id: 5, name: 'Body', slug: 'body' }
];

export function CategoryProvider({ children }) {
    const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
    const [loading, setLoading] = useState(false);

    const loadCategories = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${getApiUrl()}/categories`);
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data) && data.length > 0) {
                    setCategories(data);
                }
            }
        } catch (err) {
            console.warn('Using default taxonomy; categories endpoint offline:', err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCategories();
    }, []);

    return (
        <CategoryContext.Provider
            value={{
                categories,
                loading,
                refreshCategories: loadCategories
            }}
        >
            {children}
        </CategoryContext.Provider>
    );
}

export function useCategories() {
    return useContext(CategoryContext);
}
