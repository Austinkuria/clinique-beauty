import { useState, useCallback } from 'react';
import { useAuth as useClerkAuth } from '@clerk/clerk-react';
import mockUsers from '../data/mockUserData';

// Base API client for authenticated requests
export const useAdminApi = () => {
  const { getToken } = useClerkAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // Helper function for authenticated API calls
  const fetchWithAuth = async (endpoint, options = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const token = await getToken();
      
      // Log the full URL being requested for debugging
      const fullUrl = `${API_BASE_URL}${endpoint}`;
      console.log(`[AdminAPI] Making request to: ${fullUrl}`);
      console.log(`[AdminAPI] With token: ${token ? 'Present' : 'Missing'}`);
        const headers = {
        'Authorization': `Bearer ${token}`,
        ...options.headers
      };
      
      // Don't set Content-Type for FormData, let the browser set it with boundary
      if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
      }
      
      const response = await fetch(fullUrl, {
        ...options,
        headers
      });
      
      console.log(`[AdminAPI] Response status: ${response.status}`);
      console.log(`[AdminAPI] Response headers:`, response.headers);
      
      if (!response.ok) {
        const responseText = await response.text();
        console.error(`[AdminAPI] Error response: ${responseText}`);
        
        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch {
          // If response is not JSON (like HTML), create a generic error
          errorData = { message: `API error: ${response.status} - ${responseText.substring(0, 100)}...` };
        }
        
        throw new Error(errorData.message || `API error: ${response.status}`);
      }
      
      const responseText = await response.text();
      console.log(`[AdminAPI] Response body: ${responseText.substring(0, 200)}...`);
      
      // Try to parse JSON, but handle non-JSON responses gracefully
      try {
        return JSON.parse(responseText);
      } catch {
        console.error(`[AdminAPI] Response is not valid JSON: ${responseText.substring(0, 100)}...`);
        throw new Error('Received non-JSON response from server');
      }
    } catch (err) {
      console.error(`[AdminAPI] Request failed:`, err);
      setError(err.message || 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  };
  // Admin Dashboard API
  const getDashboardData = async (timeRange = 'monthly') => {
    return fetchWithAuth(`/admin/dashboard?timeRange=${timeRange}`);
  };

  // Users API
  const getUsers = async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    return fetchWithAuth(`/admin/users?${queryParams}`);
  };
  
  const getUserDetails = async (userId) => {
    return fetchWithAuth(`/admin/users/${userId}`);
  };
  
  const updateUserRole = async (userId, role) => {
    return fetchWithAuth(`/admin/users/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role })
    });
  };// Products API
  const getProducts = async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = `/admin/products${queryParams ? `?${queryParams}` : ''}`;
    return fetchWithAuth(endpoint);
  };
  const createProduct = async (formData) => {
    if (!(formData instanceof FormData)) {
      console.error("useAdminApi.createProduct expects FormData.");
      throw new Error("Invalid data format for product creation. Expected FormData.");
    }
    setLoading(true);
    setError(null);
    try {
      // Use _request directly for FormData to ensure correct Content-Type handling and auth
      const result = await _request('POST', '/admin/products', formData, true);
      return result;
    } catch (err) {
      setError(err.message || 'An error occurred during product creation.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const importProducts = async (formData) => { // New function for FormData
    if (!(formData instanceof FormData)) {
      console.error("useAdminApi.importProducts expects FormData.");
      throw new Error("Invalid data format for product import. Expected a file (FormData).");
    }
    setLoading(true);
    setError(null);
    try {      // Use _request directly for FormData to ensure correct Content-Type handling and auth
      // The endpoint should be your server's endpoint for bulk product import from a file.
      const result = await _request('POST', '/admin/products/import', formData, true);
      return result;
    } catch (err) {
      setError(err.message || 'An error occurred during product import.');
      // console.error("Error in importProducts:", err); // Keep for debugging if needed
      throw err;
    } finally {
      setLoading(false);
    }
  };    const updateProduct = async (productId, productData) => {
    // Handle both FormData and regular objects
    if (productData instanceof FormData) {
      return fetchWithAuth(`/admin/products/${productId}`, {
        method: 'PUT',
        body: productData // Don't stringify FormData
      });
    } else {
      return fetchWithAuth(`/admin/products/${productId}`, {
        method: 'PUT',
        body: JSON.stringify(productData)
      });
    }
  };
  
  const deleteProduct = async (productId) => {
    return fetchWithAuth(`/admin/products/${productId}`, {
      method: 'DELETE'
    });
  };

  // Orders API
  const getOrders = async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    return fetchWithAuth(`/admin/orders?${queryParams}`);
  };
  
  const getOrderDetails = async (orderId) => {
    return fetchWithAuth(`/admin/orders/${orderId}`);
  };
  
  const updateOrderStatus = async (orderId, status) => {
    return fetchWithAuth(`/admin/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  };

  return {
    loading,
    error,
    // Dashboard
    getDashboardData,
    // Users    getUsers,
    getUserDetails,
    updateUserRole,    // Products
    getProducts,
    createProduct, // Use the FormData version
    importProducts, // Added new import function
    updateProduct,
    deleteProduct,
    // Orders
    getOrders,
    getOrderDetails,
    updateOrderStatus,
  };
};

// Helper function to get the Express server URL (for seller operations)
const getExpressServerUrl = () => {
  const expressUrl = import.meta.env.VITE_EXPRESS_SERVER_URL || 'http://localhost:5000';
  console.log('[apiClient] Using Express server URL for seller operations:', expressUrl);
  return expressUrl;
};

// Seller API for authenticated seller requests
// Updated: 2025-06-27 - Modified to use Supabase Functions instead of direct Express server
export const useSellerApi = () => {
  const { getToken } = useClerkAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Helper function for authenticated API calls to Supabase Functions
  const fetchWithAuth = useCallback(async (endpoint, options = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const token = await getToken();
      
      // Ensure endpoint starts with '/'
      const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
      
      // Use API_BASE_URL which points to Supabase Functions
      const fullUrl = `${API_BASE_URL}${cleanEndpoint}`;
      console.log(`[SellerAPI] Making request to: ${fullUrl}`);
      
      const headers = {
        'Authorization': `Bearer ${token}`,
        ...options.headers
      };
      
      // Don't set Content-Type for FormData, let the browser set it with boundary
      if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
      }

      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(fullUrl, {
        ...options,
        headers,
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      
      console.log(`[SellerAPI] Response status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText || `Server error: ${response.status}` };
        }
        
        const error = new Error(errorData.message || 'API request failed');
        error.status = response.status;
        error.data = errorData;
        throw error;
      }
      
      // Try to parse the response as JSON, but handle text responses too
      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }
      
      setError(null);
      return data;
    } catch (err) {
      console.error('API Error:', err);
      
      // Handle timeout errors
      if (err.name === 'AbortError') {
        const timeoutError = new Error('Request timed out. Please check your internet connection and try again.');
        setError(timeoutError.message);
        throw timeoutError;
      }
      
      setError(err.message || 'Failed to fetch data');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getToken]);
  
  // Apply as seller
  const applyAsSeller = async (formData) => {
    console.log('[apiClient] Submitting seller application to Supabase Function: /seller/apply');
    const response = await fetchWithAuth('/seller/apply', {
      method: 'POST',
      body: formData
    });
    console.log('[apiClient] Seller application submission response:', response);
    return response;
  };
  
  // Get seller application status
  const getSellerStatus = useCallback(async () => {
    console.log('[apiClient] Requesting seller application status from Supabase Function: /seller/application/status');
    const response = await fetchWithAuth('/seller/application/status');
    console.log('[apiClient] Seller application status response:', response);
    return response;
  }, [fetchWithAuth]);
  
  // Get seller profile
  const getSellerProfile = useCallback(async () => {
    const response = await fetchWithAuth('/seller/profile');
    return response;
  }, [fetchWithAuth]);

  // Product Management Functions
  const getSellerProducts = useCallback(async () => {
    console.log('[apiClient] Fetching seller products from Supabase Function: /seller/products');
    const response = await fetchWithAuth('/seller/products');
    console.log('[apiClient] Seller products response:', response);
    return response;
  }, [fetchWithAuth]);

  const createProduct = useCallback(async (productData) => {
    console.log('[apiClient] Creating product via Supabase Function: /seller/products');
    const response = await fetchWithAuth('/seller/products', {
      method: 'POST',
      body: productData instanceof FormData ? productData : JSON.stringify(productData)
    });
    console.log('[apiClient] Create product response:', response);
    return response;
  }, [fetchWithAuth]);

  const updateProduct = useCallback(async (productId, productData) => {
    console.log(`[apiClient] Updating product ${productId} via Supabase Function: /seller/products/${productId}`);
    const response = await fetchWithAuth(`/seller/products/${productId}`, {
      method: 'PUT',
      body: productData instanceof FormData ? productData : JSON.stringify(productData)
    });
    console.log('[apiClient] Update product response:', response);
    return response;
  }, [fetchWithAuth]);

  const deleteProduct = useCallback(async (productId) => {
    console.log(`[apiClient] Deleting product ${productId} via Supabase Function: /seller/products/${productId}`);
    const response = await fetchWithAuth(`/seller/products/${productId}`, {
      method: 'DELETE'
    });
    console.log('[apiClient] Delete product response:', response);
    return response;
  }, [fetchWithAuth]);

  return {
    loading,
    error,
    // User & Seller Profile
    applyAsSeller,
    getSellerStatus,
    getSellerProfile,
    // Product Management
    getSellerProducts,
    createProduct,
    updateProduct,
    deleteProduct
  };
};


// Base URL for your API - Use the Supabase Functions URL + function name
const DIRECT_API_URL = import.meta.env.VITE_API_URL;
const SUPABASE_FUNCTIONS_BASE = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL;

console.log('Environment check:', {
  VITE_API_URL: import.meta.env.VITE_API_URL,
  VITE_SUPABASE_FUNCTIONS_URL: import.meta.env.VITE_SUPABASE_FUNCTIONS_URL,
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL
});

// Use direct API URL if available, otherwise construct it
const constructApiBaseUrl = () => {
  // First try the direct API URL from env
  if (DIRECT_API_URL) {
    console.log('Using direct API URL from VITE_API_URL:', DIRECT_API_URL);
    return DIRECT_API_URL;
  }
  
  console.log('constructApiBaseUrl called with SUPABASE_FUNCTIONS_BASE:', SUPABASE_FUNCTIONS_BASE);
  
  if (!SUPABASE_FUNCTIONS_BASE) {
    console.warn('SUPABASE_FUNCTIONS_BASE is not defined, falling back to localhost');
    return `http://localhost:5000/api`; // Fallback to Express server
  }
  
  // Remove trailing slash if present
  const baseUrl = SUPABASE_FUNCTIONS_BASE.replace(/\/$/, '');
  
  // Log the base URL for debugging
  console.log("Base URL before processing:", baseUrl);
  
  // Check if the URL already contains "functions/v1"
  if (baseUrl.includes('/functions/v1')) {
    const finalUrl = `${baseUrl}/api`;
    console.log("Final API URL (already has functions/v1):", finalUrl);
    return finalUrl; // Already has the path
  } else {
    const finalUrl = `${baseUrl}/functions/v1/api`;
    console.log("Final API URL (added functions/v1):", finalUrl);
    return finalUrl; // Add the full path
  }
};

// Use the corrected function to set API_BASE_URL
const API_BASE_URL = constructApiBaseUrl();

console.log("API Base URL set to:", API_BASE_URL);

if (!SUPABASE_FUNCTIONS_BASE) {
    console.warn("VITE_SUPABASE_FUNCTIONS_URL is not defined in .env. Falling back to local URL:", API_BASE_URL);
}

const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_ANON_KEY) {
    console.error("Error: VITE_SUPABASE_ANON_KEY environment variable is not set.");
    // Optionally throw an error
    // throw new Error("Missing VITE_SUPABASE_ANON_KEY environment variable.");
}

// Store the getToken function reference
let clerkGetToken = null;

// Hook to initialize the getToken function reference
export const useInitializeApi = () => {
    const { getToken } = useClerkAuth();
    if (getToken && !clerkGetToken) {
        clerkGetToken = getToken;
        console.log("API Client: Clerk getToken function initialized.");
    }
};

// For fallback mode, use Express server directly for user sync
const useExpressServerDirectly = () => {
  const endpoint = 'http://localhost:5000';
  console.log("Using Express server directly:", endpoint);
  return endpoint;
};

// Add this function to handle products with missing data fields
const transformProductData = (product) => {
    if (!product) return product;
    
    try {
        // Log if paletteTheme is undefined but expected for this product
        if (product.paletteTheme === undefined) {
            console.warn(`Product ${product.id || product.name} is missing paletteTheme. This column may not exist in Supabase.`);
            
            // Don't add default values - just ensure the property exists
            // so that code accessing this property doesn't crash
            product.paletteTheme = null;
        }
    } catch (error) {
        console.warn(`Error handling product data: ${error.message}`, product);
        // Don't fail if transformation has an error
    }
    return product;
};

// Transform an array of products safely
const transformProductsData = (products) => {
    if (!Array.isArray(products)) return products;
    
    return products.map(product => {
        try {
            return transformProductData(product);
        } catch (error) {
            console.warn(`Error transforming a product: ${error.message}`);
            return product; // Return original product if transformation fails
        }
    });
};

// Helper function to make authenticated requests
const _request = async (method, endpoint, body = null, requiresAuth = true) => {
    // Ensure endpoint starts with '/' and combine carefully
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    // API_BASE_URL should now correctly point to the Supabase function
    const url = `${API_BASE_URL}${cleanEndpoint}`;
    const headers = new Headers(); // Initialize empty, Content-Type will be set conditionally
    let token = null;

    // --- Add Logging Here ---
    console.log(`[API Client _request] Attempting ${method} request to URL: ${url}`);
    // --- End Logging ---

    if (requiresAuth) {
        if (!clerkGetToken) {
            console.error("API Client Error: clerkGetToken function not initialized. Call useInitializeApi in your App component.");
            throw new Error("API client not ready. Authentication function missing.");
        }
        try {
            // --- CHANGE: Request session token with custom scope ---
            console.log("API Client: Requesting Clerk session token...");
            // Try with a specific resource if the default token doesn't work
            token = await clerkGetToken({ template: "supabase" });
            
            if (!token) {
                // Fall back to default token if template-specific token fails
                console.log("API Client: Specific token template failed, trying default token");
                token = await clerkGetToken();
            }
            // --- END CHANGE ---

            if (!token) {
                console.error(`API Client Error: Failed to retrieve authentication token.`);
                throw new Error("Authentication token could not be retrieved.");
            }
            headers.set('Authorization', `Bearer ${token}`);

            // --- ADD TOKEN LOGGING ---
            const tokenSnippet = token ? `${token.substring(0, 10)}...${token.substring(token.length - 10)}` : 'null/undefined';
            console.log(`API Client: ${method} ${endpoint} - Using token. Snippet: ${tokenSnippet}`);
            // --- END TOKEN LOGGING ---

        } catch (error) {
            console.error(`API Client Error: Error retrieving authentication token.`, error);
            throw new Error(`Authentication token retrieval failed: ${error.message}`);
        }
    } else {
        console.log(`API Client: ${method} ${endpoint} - No authentication required.`);
    }

    try {
        const config = {
            method: method,
            headers: headers, // Pass the Headers object
        };
        if (body) {
            if (body instanceof FormData) {
                config.body = body;
                // DO NOT set 'Content-Type' for FormData, browser handles it.
            } else {
                headers.set('Content-Type', 'application/json'); // Set for non-FormData
                config.body = JSON.stringify(body);
            }
        }

        // --- ADJUST LOGGING BEFORE FETCH ---
        // Log headers by iterating if needed, or just log the config object
        console.log(`[API Client _request] Sending fetch for ${method} ${endpoint}. Config:`, { method: config.method, headers: Object.fromEntries(config.headers.entries()), hasBody: !!config.body });
        // --- END ADJUST LOGGING ---
        const response = await fetch(url, config);

        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
            } catch (_) { // Changed 'e' to '_' to mark as intentionally unused
                errorData = { message: `HTTP error ${response.status}: ${response.statusText}` };
            }
            console.error(`API Client Error: ${method} ${endpoint} failed with status ${response.status}`, errorData);
            throw new Error(errorData.message || `Request failed with status ${response.status}`);
        }

        // Handle cases with no content response (e.g., DELETE, sometimes PUT/POST)
        if (response.status === 204 || response.headers.get('content-length') === '0') {
            console.log(`API Client: ${method} ${endpoint} - Success (No Content)`);
            return { success: true }; // Indicate success even with no body
        }

        const data = await response.json();
        console.log(`API Client: ${method} ${endpoint} - Success`, data);
        // Optionally wrap data in a success object if needed consistently
        // return { success: true, data: data };
        return data; // Return data directly if backend doesn't wrap it

    } catch (error) {
        console.error(`API Client Error: Network or other error during ${method} ${endpoint}.`, error);
        // Re-throw the error to be caught by the calling function (e.g., in CartContext)
        throw error;
    }
};

// Product methods with data transformation
const getProducts = async (category = null) => {
    const endpoint = category ? `/products?category=${encodeURIComponent(category)}` : '/products';
    const data = await _request('GET', endpoint, null, false);
    return transformProductsData(data);
};

const getProductById = async (id) => {
    const data = await _request('GET', `/products/${id}`, null, false);
    return transformProductData(data);
};

// Add this helper function to track cart item IDs
const cartItemCache = {
  items: new Map(),
  
  // Store cart items when they're fetched
  storeItems: function(cartItems) {
    if (Array.isArray(cartItems)) {
      cartItems.forEach(item => {
        const key = item.id || item.cartItemId || item.product_id;
        if (key) {
          this.items.set(key, item);
        }
      });
      console.log(`[Cart Cache] Stored ${this.items.size} cart items`);
    }
  },
  
  // Get cart item by ID
  getItem: function(id) {
    return this.items.get(id);
  },
  
  // Clear the cache
  clear: function() {
    this.items.clear();
    console.log('[Cart Cache] Cleared');
  }
};

// Enhanced cart methods with better error handling and caching
const getCart = async () => {
  try {
    const cartItems = await _request('GET', '/cart', null, true);
    // Store cart items in cache for later use
    cartItemCache.storeItems(cartItems);
    return cartItems;
  } catch (error) {
    console.warn("First attempt to get cart failed, retrying...", error);
    
    // Short delay before retry
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Try one more time
    try {
      // Try with a refreshed token on the second attempt
      if (clerkGetToken) {
        // Force token refresh
        const refreshedToken = await clerkGetToken({ skipCache: true });
        console.log("Retrying with refreshed token...");
        
        // Make direct fetch with refreshed token
        const response = await fetch(`${API_BASE_URL}/cart`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${refreshedToken}`
          }
        });
        
        if (response.ok) {
          const cart = await response.json();
          cartItemCache.storeItems(cart);
          return cart;
        }
      }
      
      // Fall back to standard request if direct fetch fails
      const cart = await _request('GET', '/cart', null, true);
      cartItemCache.storeItems(cart);
      return cart;
    } catch (retryError) {
      console.error("Cart retry also failed:", retryError);
      
      // In development, return empty cart to keep app working
      if (import.meta.env.DEV) {
        console.log("DEV MODE: Returning empty cart");
        return { items: [], total: 0 };
      }
      
      throw retryError;
    }
  }
};

const addToCart = async (itemData) => {
  try {
    const result = await _request('POST', '/cart/add', itemData, true);
    // Add newly added item to the cache
    if (result && result.data) {
      cartItemCache.storeItems([result.data]);
    }
    return result;
  } catch (error) {
    console.error("Failed to add item to cart:", error);
    // Re-throw for component handling
    throw error;
  }
};

// Enhance the updateCartItemQuantity method to better handle cart items
const updateCartItemQuantity = async (itemData) => {
  try {
    // Enhanced logging to debug update issues
    console.log(`[API Client] Updating cart item ${itemData.itemId} to quantity ${itemData.quantity}`);
    
    // Check if we have a proper itemId
    if (!itemData.itemId) {
      console.error("[API Client] Missing itemId in updateCartItemQuantity call", itemData);
      
      // If we have a productId, try to use the add endpoint with replace flag
      if (itemData.productId) {
        console.log("[API Client] Attempting to use add endpoint to update item");
        return await addToCart({
          productId: itemData.productId,
          quantity: itemData.quantity,
          replace: true // Signal the server this is an update
        });
      }
      
      throw new Error("Missing itemId for cart update");
    }
    
    // For development, add a fallback mechanism when update fails
    const result = await _request('PUT', '/cart/update', itemData, true);
    return result;
  } catch (error) {
    console.error("Failed to update cart item:", error);
    
    // In development, offer a fallback approach
    if (import.meta.env.DEV) {
      console.log("[API Client] DEV MODE: Attempting cart refresh and retry after update failure");
      
      try {
        // Refresh the cart first to get fresh cart item IDs
        await getCart();
        
        // Try a different approach - delete and re-add
        if (itemData.productId) {
          console.log("[API Client] DEV MODE: Attempting to delete and re-add item instead of update");
          
          // Remove the item (silently catch errors)
          try {
            await _request('DELETE', '/cart/remove', { itemId: itemData.itemId }, true);
          } catch (removeError) {
            console.log("[API Client] DEV MODE: Remove attempt failed, continuing with add", removeError);
          }
          
          // Add the item with new quantity
          const addResult = await _request('POST', '/cart/add', {
            productId: itemData.productId,
            quantity: itemData.quantity
          }, true);
          
          console.log("[API Client] DEV MODE: Delete+re-add approach succeeded");
          return addResult;
        }
      } catch (fallbackError) {
        console.error("[API Client] DEV MODE: Fallback approach also failed", fallbackError);
      }
      
      // Return mock success for development to keep app working
      return { 
        success: true, 
        simulated: true,
        message: "Simulated success response in development" 
      };
    }
    
    // Re-throw for component handling
    throw error;
  }
};

const removeFromCart = async (itemData) => {
  try {
    console.log("[API Client removeFromCart] Attempting to remove item:", itemData);
    
    // Handle different input formats: string ID, object with itemId, or object with id
    let itemId;
    if (typeof itemData === 'string') {
      itemId = itemData;
    } else if (itemData && typeof itemData === 'object') {
      // Try all possible ID properties
      itemId = itemData.itemId || itemData.id || itemData.cartItemId || itemData.productId;
    }
    
    if (!itemId) {
      console.error("[API Client removeFromCart] No valid ID found in:", itemData);
      throw new Error("Missing item identifier for cart removal");
    }
    
    console.log(`[API Client removeFromCart] Extracted itemId: ${itemId}`);
    
    // Send both the itemId and a full payload to the server for maximum compatibility
    const payload = {
      itemId: itemId,
      // Include these extra fields to help server-side debugging
      originalItem: typeof itemData === 'object' ? itemData : { id: itemId },
      timestamp: new Date().toISOString()
    };
    
    // First try using the DELETE /cart/remove endpoint with body payload
    try {
      console.log(`[API Client removeFromCart] Calling DELETE /cart/remove with payload:`, payload);
      const result = await _request('DELETE', '/cart/remove', payload, true);
      console.log("[API Client removeFromCart] Success response:", result);
      return result;
    } catch (primaryError) {
      console.error("[API Client removeFromCart] Primary removal attempt failed:", primaryError);
      
      // Fall back to the DELETE /cart/:id endpoint
      console.log(`[API Client removeFromCart] Trying fallback DELETE /cart/${itemId}`);
      try {
        const fallbackResult = await _request('DELETE', `/cart/${itemId}`, null, true);
        console.log("[API Client removeFromCart] Fallback success:", fallbackResult);
        return fallbackResult;
      } catch (fallbackError) {
        console.error("[API Client removeFromCart] Fallback attempt also failed:", fallbackError);
        
        // Try direct DELETE request as last resort
        console.log(`[API Client removeFromCart] Attempting direct fetch to /api/cart/${itemId}`);
        
        // Get token from clerk
        const token = clerkGetToken ? await clerkGetToken() : null;
        if (!token) {
          throw new Error("No authentication token available");
        }
        
        const directResponse = await fetch(`${API_BASE_URL}/cart/${itemId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!directResponse.ok) {
          throw new Error(`Direct DELETE failed with status ${directResponse.status}`);
        }
        
        const directResult = await directResponse.json();
        console.log("[API Client removeFromCart] Direct fetch succeeded:", directResult);
        return directResult;
      }
    }
  } catch (error) {
    console.error("[API Client removeFromCart] All removal attempts failed:", error);
    
    // In development, return simulated success
    if (import.meta.env.DEV) {
      console.log("[API Client removeFromCart] DEV MODE: Returning simulated success");
      return { 
        success: true, 
        simulated: true,
        message: "Simulated success in development",
        itemData: itemData
      };
    }
    
    throw error;
  } finally {
    // Force a cart refresh after removal attempt, regardless of outcome
    try {
      console.log("[API Client removeFromCart] Scheduling cart refresh");
      setTimeout(async () => {
        try {
          console.log("[API Client removeFromCart] Executing forced cart refresh");
          await getCart();
          console.log("[API Client removeFromCart] Cart refreshed after removal attempt");
        } catch (refreshError) {
          console.error("[API Client removeFromCart] Cart refresh failed:", refreshError);
        }
      }, 700); // Short delay before refresh
    } catch (refreshError) {
      console.error("[API Client removeFromCart] Failed to schedule cart refresh:", refreshError);
    }
  }
};

const clearCart = async () => {
  try {
    const result = await _request('DELETE', '/cart/clear', null, true);
    // Clear cart cache
    cartItemCache.clear();
    return result;
  } catch (error) {
    console.error("Failed to clear cart:", error);
    throw error;
  }
};

// Update the cart item format function to ensure cartItemId is properly set
const formatCartItem = (item) => {
  if (!item) return null;
  
  // Ensure the item has a cartItemId property (could be id or cartItemId)
  const formattedItem = {
    ...item,
    cartItemId: item.cartItemId || item.id, // Prioritize existing cartItemId
    id: item.product_id || item.id // Use product_id as the main ID
  };
  
  console.log(`[API Client] Formatted cart item: ${JSON.stringify({
    cartItemId: formattedItem.cartItemId,
    id: formattedItem.id,
    quantity: formattedItem.quantity
  })}`);
  
  return formattedItem;
};

// Add a syncUser method to the API client
const syncUser = async (userData) => {
  console.log("Syncing user data to server:", userData);
  try {
    // First, check if we're in development with a running Express server
    let expressSuccess = false;
    
    if (import.meta.env.DEV) {
      try {
        const expressUrl = `${useExpressServerDirectly()}/api/users/sync`;
        console.log("Attempting direct Express endpoint for user sync:", expressUrl);
        
        const headers = new Headers({ 'Content-Type': 'application/json' });
        if (clerkGetToken) {
          const token = await clerkGetToken();
          headers.set('Authorization', `Bearer ${token}`);
        }
        
        // First try the Express server with a short timeout
        const response = await fetch(expressUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify(userData),
          signal: AbortSignal.timeout(3000) // 3 second timeout
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log("User sync successful via Express server:", data);
          expressSuccess = true;
          return data;
        }
      } catch (expressError) {
        console.warn("Express server not available, falling back to Supabase function:", expressError.message);
      }
    }
    
    if (!expressSuccess) {
      // Fallback to Supabase function
      console.log("Using Supabase function for user sync");
      
      // Use the _request method which uses API_BASE_URL
      try {
        // Delay a bit to ensure Clerk token is ready
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Try the request with explicit token
        const token = await clerkGetToken();
        const supabaseApiUrl = `${API_BASE_URL}/users/sync`;
        console.log(`Making direct fetch to ${supabaseApiUrl} with token`);
        
        const response = await fetch(supabaseApiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(userData)
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log("User sync successful with direct fetch:", data);
          return data;
        } else {
          console.error(`User sync failed with status ${response.status}`);
          try {
            const errorData = await response.json();
            console.error("Error response:", errorData);
          } catch (e) {
            console.error("Could not parse error response");
          }
          throw new Error(`User sync failed with status ${response.status}`);
        }
      } catch (directFetchError) {
        console.error("Direct fetch for user sync failed:", directFetchError);
        
        try {
          console.log("Attempting standard _request method as fallback");
          const supabaseResponse = await _request('POST', '/users/sync', userData, true);
          console.log("User sync successful via standard _request:", supabaseResponse);
          return supabaseResponse;
        } catch (supabaseError) {
          console.error("Supabase function user sync failed:", supabaseError);
          
          // Simulated success response for development only
          if (import.meta.env.DEV) {
            console.log("DEV MODE: Returning simulated success response");
            return {
              success: true,
              data: {
                id: "simulated-id",
                clerk_id: userData.clerkId,
                email: userData.email,
                name: userData.name,
                simulated: true
              }
            };
          }
          
          throw supabaseError;
        }
      }
    }
  } catch (error) {
    console.error("User sync failed:", error);
    
    // In development, return a simulated success response
    if (import.meta.env.DEV) {
      console.log("DEV MODE: Returning simulated success response after error");
      return {
        success: true,
        data: {
          id: "simulated-id",
          clerk_id: userData.clerkId,
          email: userData.email,
          name: userData.name,
          simulated: true
        }
      };
    }
    
    // For production, return a partial success
    return { 
      success: false, 
      message: "User sync failed, but app will continue to function",
      error: error.message
    };
  }
};

// Add this method to your API client class
const updateUserRole = async (userId, role, token) => {
    try {
        console.log(`[API Client] Updating user ${userId} role to ${role}`);
        
        // Try direct API endpoint first
        try {
            const directUrl = `${API_BASE_URL}/users/set-admin`;
            console.log(`[API Client] Calling ${directUrl}`);
            
            const directResponse = await fetch(directUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : ''
                },
                body: JSON.stringify({ 
                    clerkId: userId 
                })
            });
            
            if (directResponse.ok) {
                const directData = await directResponse.json();
                console.log(`[API Client] Role update successful via direct API call`);
                return directData;
            } else {
                const errorData = await directResponse.json();
                console.warn('[API Client] Direct API call failed:', errorData);
                throw new Error(errorData.message || 'Failed to update role through API');
            }
        } catch (directError) {
            console.warn('[API Client] Direct API call error:', directError);
            
            // Fall back to standard request method
            try {
                const response = await _request('POST', '/users/update-role', { 
                    userId, 
                    role 
                }, true);
                
                console.log(`[API Client] Role update successful via standard request`);
                return response;
            } catch (standardError) {
                console.warn('[API Client] Standard request failed:', standardError);
                throw standardError;
            }
        }
    } catch (error) {
        console.error('[API Client] Error updating user role:', error);
        
        // In development mode, return a simulated success response
        if (import.meta.env.DEV) {
            console.log('[API Client] DEV MODE: Returning simulated success');
            return {
                success: true,
                simulated: true,
                message: "Role update simulated in development mode"
            };
        }
        
        throw error;
    }
};

// ... (other methods like getWishlist, addToWishlist, etc. - set requiresAuth accordingly) ...

// Import the centralized mock data
import mockDashboardData from '../data/mockDashboardData';

export const api = {
    getProducts,
    getProductById,
    createProduct: async (formData) => {
        // The endpoint '/products' will be appended to API_BASE_URL.
        // true indicates that authentication is required.
        return _request('POST', '/products', formData, true);
    },
    // Updated cart methods
    getCart,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    // Helper function for components
    formatCartItem,
    // Add createProduct method
    createProduct: async (formData) => {
        // Endpoint is /products, as API_BASE_URL handles the /api prefix.
        // This assumes the backend route is POST /api/products and requires authentication.
        return _request('POST', '/products', formData, true);
    },
    // ... other existing methods
    updateUserRole,
    syncUser,
    // Add or update the dashboard data method
    getDashboardData: async (timeRange = 'monthly') => {
        try {
            const endpoint = `/admin/dashboard?timeRange=${timeRange}`;
            return await _request('GET', endpoint, null, true);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            
            // In development, return mock data to keep the app working
            if (import.meta.env.DEV) {
                console.log('DEV MODE: Returning simulated dashboard data');
                
                // Try fetching from local server first
                try {
                    const response = await fetch(`http://localhost:5000/api/admin/dashboard?timeRange=${timeRange}`);
                    if (response.ok) {
                        return await response.json();
                    }
                } catch (serverError) {
                    console.warn('Failed to fetch from local server:', serverError);
                }
                
                // Fall back to imported mock data
                return {
                    success: true,
                    data: mockDashboardData
                };
            }
            
            throw error;
        }
    },
    getUsers: async (filters = {}) => {
      try {
        const queryParams = new URLSearchParams(filters).toString();
        const response = await _request('GET', `/admin/users?${queryParams}`, null, true);
        
        // For development mode, provide mock data if the API isn't available
        if (import.meta.env.DEV && (!response || !response.data)) {
          console.log('DEV MODE: Returning mock user data');
          return getMockUsers();
        }
        
        return response.data || [];
      } catch (error) {
        console.error('Error fetching users:', error);
        
        // In development, return mock data to keep the app working
        if (import.meta.env.DEV) {
          console.log('DEV MODE: Returning mock user data after error');
          return getMockUsers();
        }
        throw error;
      }
    },
    getUserDetails: async (userId) => {
      // Implementation for getting a specific user's details
    },
    verifyUser: async (userId) => {
      // Implementation for verifying a user
    },
    suspendUser: async (userId) => {
      // Implementation for suspending a user
    },
    activateUser: async (userId) => {
      // Implementation for activating a user
    },
    importProducts: async (formData) => { // Exposing importProducts via global api object as well
        if (!(formData instanceof FormData)) {
            throw new Error("Invalid data format for product import. Expected FormData.");
        }
        // Corrected endpoint: removed leading '/api' as API_BASE_URL should handle it.
        return await _request('POST', '/admin/products/import', formData, true);
    },
};

// Helper function to generate mock users for development
function getMockUsers() {
  return mockUsers;
}

// Hook to use the API client instance
export const useApi = () => {
    // This hook doesn't need to do much now,
    // as initialization happens via useInitializeApi
    // and the api object uses the stored clerkGetToken.
    return api;
};
