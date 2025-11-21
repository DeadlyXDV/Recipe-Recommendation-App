// API base URL - menggunakan relative path untuk proxy di development
const API_URL = '/api';

// Helper untuk menambahkan token ke header
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

// Auth API
export const authAPI = {
  signup: async (name: string, email: string, password: string) => {
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    return response.json();
  },

  login: async (email: string, password: string) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return response.json();
  },

  getProfile: async () => {
    const response = await fetch(`${API_URL}/auth/profile`, {
      headers: getAuthHeaders()
    });
    return response.json();
  }
};

// Recipe API
export const recipeAPI = {
  saveRecipe: async (recipeId: string, recipeName: string, recipeImage: string) => {
    const response = await fetch(`${API_URL}/recipes/save`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ recipeId, recipeName, recipeImage })
    });
    return response.json();
  },

  unsaveRecipe: async (recipeId: string) => {
    const response = await fetch(`${API_URL}/recipes/unsave/${recipeId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return response.json();
  },

  getSavedRecipes: async () => {
    const response = await fetch(`${API_URL}/recipes/saved`, {
      headers: getAuthHeaders()
    });
    return response.json();
  },

  checkRecipeSaved: async (recipeId: string) => {
    const response = await fetch(`${API_URL}/recipes/check/${recipeId}`, {
      headers: getAuthHeaders()
    });
    return response.json();
  }
};
