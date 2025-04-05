const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const fetchData = async (endpoint, options = {}) => {
  const response = await fetch(${API_URL}, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  if (!response.ok) throw new Error('API request failed');
  return response.json();
};
