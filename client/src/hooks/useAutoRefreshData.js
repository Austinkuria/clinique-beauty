import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook for auto-refreshing data with smart caching and background sync
 * @param {Function} fetchFn - Function to fetch data
 * @param {Object} options - Configuration options
 * @returns {Object} - { data, loading, error, refetch, lastUpdated }
 */
export const useAutoRefreshData = (fetchFn, options = {}) => {
  const {
    key = 'default',
    staleTime = 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus = true,
    refetchOnReconnect = true,
    refetchInterval = null, // Set to number for polling
    fallbackData = [],
    retryCount = 3,
    retryDelay = 1000,
  } = options;

  const [data, setData] = useState(fallbackData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  
  const cacheRef = useRef(new Map());
  const retryTimeoutRef = useRef(null);
  const intervalRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Get cached data
  const getCachedData = useCallback(() => {
    const cached = cacheRef.current.get(key);
    if (cached && Date.now() - cached.timestamp < staleTime) {
      return cached.data;
    }
    return null;
  }, [key, staleTime]);

  // Set cached data
  const setCachedData = useCallback((data) => {
    cacheRef.current.set(key, {
      data,
      timestamp: Date.now()
    });
  }, [key]);

  // Fetch data with retry logic
  const fetchWithRetry = useCallback(async (retries = 0) => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    try {
      const result = await fetchFn(abortControllerRef.current.signal);
      
      // Clear any pending retry
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }

      setData(result);
      setError(null);
      setLastUpdated(new Date());
      setCachedData(result);
      
      return result;
    } catch (err) {
      // Don't retry if aborted
      if (err.name === 'AbortError') {
        return;
      }

      console.error(`Fetch failed (attempt ${retries + 1}):`, err);
      
      if (retries < retryCount) {
        const delay = retryDelay * Math.pow(2, retries); // Exponential backoff
        
        retryTimeoutRef.current = setTimeout(() => {
          fetchWithRetry(retries + 1);
        }, delay);
      } else {
        setError(err);
        
        // Use cached data if available
        const cachedData = getCachedData();
        if (cachedData) {
          setData(cachedData);
          console.log('Using cached data due to fetch failure');
        }
      }
    }
  }, [fetchFn, retryCount, retryDelay, getCachedData, setCachedData]);

  // Main refetch function
  const refetch = useCallback(async (force = false) => {
    // Use cached data if not forcing and cache is fresh
    if (!force) {
      const cachedData = getCachedData();
      if (cachedData) {
        setData(cachedData);
        setLoading(false);
        setError(null);
        
        // Still fetch in background to update cache
        fetchWithRetry();
        return cachedData;
      }
    }

    setLoading(true);
    setError(null);
    
    return await fetchWithRetry();
  }, [getCachedData, fetchWithRetry]);

  // Handle window focus
  useEffect(() => {
    if (!refetchOnWindowFocus) return;

    const handleFocus = () => {
      // Only refetch if data is stale
      const cachedData = getCachedData();
      if (!cachedData) {
        refetch();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refetchOnWindowFocus, refetch, getCachedData]);

  // Handle online/offline
  useEffect(() => {
    if (!refetchOnReconnect) return;

    const handleOnline = () => {
      refetch();
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [refetchOnReconnect, refetch]);

  // Handle polling
  useEffect(() => {
    if (!refetchInterval) return;

    intervalRef.current = setInterval(() => {
      refetch();
    }, refetchInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [refetchInterval, refetch]);

  // Initial fetch
  useEffect(() => {
    refetch();
    
    // Cleanup on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [refetch]);

  // Final loading state
  useEffect(() => {
    const cachedData = getCachedData();
    if (cachedData && loading) {
      setData(cachedData);
      setLoading(false);
    }
  }, [loading, getCachedData]);

  return {
    data,
    loading,
    error,
    refetch,
    lastUpdated,
    isStale: lastUpdated && Date.now() - lastUpdated.getTime() > staleTime
  };
};

/**
 * Hook specifically for categories data
 */
export const useCategories = (apiClient) => {
  const fetchCategories = useCallback(async (signal) => {
    try {
      // Try API method first
      return await apiClient.getCategories();
    } catch {
      // Fallback to direct fetch with proper API URLs
      const API_BASE_URL = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL || 'https://zdbfjwienzjdjpawcnuc.supabase.co/functions/v1/api';
      const FALLBACK_API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      
      let response;
      try {
        response = await fetch(`${API_BASE_URL}/categories`, { signal });
      } catch {
        response = await fetch(`${FALLBACK_API_BASE_URL}/categories`, { signal });
      }
      
      if (!response.ok) {
        throw new Error(`Failed to fetch categories: ${response.statusText}`);
      }
      return await response.json();
    }
  }, [apiClient]);

  return useAutoRefreshData(fetchCategories, {
    key: 'categories',
    staleTime: 10 * 60 * 1000, // 10 minutes for categories
    fallbackData: [
      { id: 1, name: 'Skincare' },
      { id: 2, name: 'Makeup' },
      { id: 3, name: 'Fragrance' },
      { id: 4, name: 'Hair' },
      { id: 5, name: 'Body' }
    ]
  });
};

/**
 * Hook specifically for tags data
 */
export const useTags = (apiClient) => {
  const fetchTags = useCallback(async (signal) => {
    try {
      // Try API method first
      return await apiClient.getTags();
    } catch {
      // Fallback to direct fetch with proper API URLs
      const API_BASE_URL = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL || 'https://zdbfjwienzjdjpawcnuc.supabase.co/functions/v1/api';
      const FALLBACK_API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      
      let response;
      try {
        response = await fetch(`${API_BASE_URL}/tags`, { signal });
      } catch {
        response = await fetch(`${FALLBACK_API_BASE_URL}/tags`, { signal });
      }
      
      if (!response.ok) {
        throw new Error(`Failed to fetch tags: ${response.statusText}`);
      }
      return await response.json();
    }
  }, [apiClient]);

  return useAutoRefreshData(fetchTags, {
    key: 'tags',
    staleTime: 10 * 60 * 1000, // 10 minutes for tags
    fallbackData: [
      { id: 1, name: 'New Arrival' },
      { id: 2, name: 'Best Seller' },
      { id: 3, name: 'Limited Edition' },
      { id: 4, name: 'Sale' },
      { id: 5, name: 'Organic' },
      { id: 6, name: 'Vegan' }
    ]
  });
};
