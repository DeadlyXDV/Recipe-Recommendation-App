import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

// Use environment variable for API URL
const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://192.168.100.3:5000/api';

console.log('🔧 API_URL:', API_URL);
console.log('🔧 Constants.expoConfig?.extra:', Constants.expoConfig?.extra);

// Create axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - could trigger logout here
      console.error('Unauthorized - token may be invalid');
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  signup: async (name: string, email: string, password: string) => {
    return await apiClient.post('/auth/signup', { name, email, password });
  },

  login: async (email: string, password: string) => {
    return await apiClient.post('/auth/login', { email, password });
  },

  getProfile: async () => {
    return await apiClient.get('/auth/profile');
  },
};

// Recipe API
export const recipeAPI = {
  saveRecipe: async (recipeId: string, recipeName: string, recipeImage: string) => {
    return await apiClient.post('/recipes/save', { recipeId, recipeName, recipeImage });
  },

  unsaveRecipe: async (recipeId: string) => {
    return await apiClient.delete(`/recipes/unsave/${recipeId}`);
  },

  getSavedRecipes: async () => {
    return await apiClient.get('/recipes/saved');
  },

  checkRecipeSaved: async (recipeId: string) => {
    return await apiClient.get(`/recipes/check/${recipeId}`);
  },

  // Like API
  toggleLike: async (recipeId: string) => {
    return await apiClient.post(`/recipes/${recipeId}/like`);
  },

  getLikeCount: async (recipeId: string) => {
    return await apiClient.get(`/recipes/${recipeId}/likes/count`);
  },

  getLikeStatus: async (recipeId: string) => {
    return await apiClient.get(`/recipes/${recipeId}/likes/status`);
  },

  getLikedRecipes: async () => {
    return await apiClient.get('/recipes/liked');
  },

  // Comment API
  addComment: async (recipeId: string, commentText: string) => {
    return await apiClient.post(`/recipes/${recipeId}/comments`, { commentText });
  },

  getComments: async (recipeId: string) => {
    return await apiClient.get(`/recipes/${recipeId}/comments`);
  },

  deleteComment: async (recipeId: string, commentId: number) => {
    return await apiClient.delete(`/recipes/${recipeId}/comments/${commentId}`);
  },

  // Recommendation API
  getRecommendations: async () => {
    return await apiClient.get('/recipes/recommendations');
  },
};
