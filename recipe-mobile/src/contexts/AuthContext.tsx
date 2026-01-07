import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { authAPI, recipeAPI } from '../services/api';
import axios from 'axios';

interface User {
  id: string;
  name: string;
  email: string;
}

interface SavedRecipe {
  id: number;
  user_id: number;
  recipe_id: string;
  recipe_name: string;
  recipe_image: string;
  saved_at: string;
}

interface LikedRecipe {
  recipe_id: string;
  liked_at: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  savedRecipes: SavedRecipe[];
  saveRecipe: (recipeId: string, recipeName: string, recipeImage: string) => Promise<void>;
  unsaveRecipe: (recipeId: string) => Promise<void>;
  isRecipeSaved: (recipeId: string) => boolean;
  loadSavedRecipes: () => Promise<void>;
  likedRecipes: LikedRecipe[];
  toggleLike: (recipeId: string) => Promise<{ isLiked: boolean; count: number }>;
  isRecipeLiked: (recipeId: string) => boolean;
  loadLikedRecipes: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [savedRecipes, setSavedRecipes] = useState<SavedRecipe[]>([]);
  const [likedRecipes, setLikedRecipes] = useState<LikedRecipe[]>([]);

  // Load user and token from SecureStore on mount
  useEffect(() => {
    loadStoredUser();
  }, []);

  // Load saved recipes and liked recipes from backend when user changes
  useEffect(() => {
    if (user) {
      loadSavedRecipes();
      loadLikedRecipes();
    } else {
      setSavedRecipes([]);
      setLikedRecipes([]);
    }
  }, [user]);

  const loadStoredUser = async () => {
    try {
      const storedUser = await SecureStore.getItemAsync('user');
      const token = await SecureStore.getItemAsync('token');
      if (storedUser && token) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error loading stored user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSavedRecipes = async () => {
    try {
      const response = await recipeAPI.getSavedRecipes();
      if (response.success) {
        setSavedRecipes(response.data);
      }
    } catch (error) {
      console.error('Error loading saved recipes:', error);
    }
  };

  const loadLikedRecipes = async () => {
    try {
      const response = await recipeAPI.getLikedRecipes();
      if (response.success) {
        setLikedRecipes(response.data);
      }
    } catch (error) {
      console.error('Error loading liked recipes:', error);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('🔐 Attempting login:', { email, password: '***' });
      const response = await authAPI.login(email, password);
      console.log('🔐 Login response:', response);

      if (response.success) {
        const userData = {
          id: response.data.user.id.toString(),
          name: response.data.user.name,
          email: response.data.user.email,
        };

        // PENTING: Simpan token DULU sebelum setUser untuk menghindari race condition
        await SecureStore.setItemAsync('token', response.data.token);
        await SecureStore.setItemAsync('user', JSON.stringify(userData));
        
        // Setelah token tersimpan, baru update state user
        setUser(userData);
        return true;
      }

      return false;
    } catch (error) {
      console.error('❌ Login error:', error);
      if (axios.isAxiosError(error)) {
        console.error('❌ Axios error details:', {
          message: error.message,
          code: error.code,
          config: { baseURL: error.config?.baseURL, url: error.config?.url },
          response: error.response?.data,
        });
      }
      return false;
    }
  };

  const signup = async (
    name: string,
    email: string,
    password: string
  ): Promise<boolean> => {
    try {
      const response = await authAPI.signup(name, email, password);

      if (response.success) {
        const userData = {
          id: response.data.user.id.toString(),
          name: response.data.user.name,
          email: response.data.user.email,
        };

        // PENTING: Simpan token DULU sebelum setUser untuk menghindari race condition
        await SecureStore.setItemAsync('token', response.data.token);
        await SecureStore.setItemAsync('user', JSON.stringify(userData));
        
        // Setelah token tersimpan, baru update state user
        setUser(userData);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      setUser(null);
      setSavedRecipes([]);
      setLikedRecipes([]);
      await SecureStore.deleteItemAsync('user');
      await SecureStore.deleteItemAsync('token');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const saveRecipe = async (
    recipeId: string,
    recipeName: string,
    recipeImage: string
  ) => {
    if (!user) return;

    try {
      const response = await recipeAPI.saveRecipe(recipeId, recipeName, recipeImage);
      if (response.success) {
        await loadSavedRecipes();
      }
    } catch (error) {
      console.error('Error saving recipe:', error);
      throw error;
    }
  };

  const unsaveRecipe = async (recipeId: string) => {
    if (!user) return;

    try {
      const response = await recipeAPI.unsaveRecipe(recipeId);
      if (response.success) {
        await loadSavedRecipes();
      }
    } catch (error) {
      console.error('Error unsaving recipe:', error);
      throw error;
    }
  };

  const isRecipeSaved = (recipeId: string): boolean => {
    return savedRecipes.some((recipe) => recipe.recipe_id === recipeId);
  };

  const toggleLike = async (
    recipeId: string
  ): Promise<{ isLiked: boolean; count: number }> => {
    if (!user) throw new Error('User not authenticated');

    try {
      const response = await recipeAPI.toggleLike(recipeId);
      if (response.success) {
        await loadLikedRecipes();
        return {
          isLiked: response.data.isLiked,
          count: response.data.count,
        };
      }
      throw new Error('Failed to toggle like');
    } catch (error) {
      console.error('Error toggling like:', error);
      throw error;
    }
  };

  const isRecipeLiked = (recipeId: string): boolean => {
    return likedRecipes.some((recipe) => recipe.recipe_id === recipeId);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        signup,
        logout,
        savedRecipes,
        saveRecipe,
        unsaveRecipe,
        isRecipeSaved,
        loadSavedRecipes,
        likedRecipes,
        toggleLike,
        isRecipeLiked,
        loadLikedRecipes,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
