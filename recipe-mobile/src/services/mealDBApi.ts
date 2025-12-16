import axios from 'axios';
import { Recipe } from '../types/recipe';

const MEALDB_API_BASE = 'https://www.themealdb.com/api/json/v1/1';

export const mealDBApi = {
  // Search recipes by ingredient
  searchByIngredient: async (ingredient: string): Promise<Recipe[]> => {
    try {
      const response = await axios.get(`${MEALDB_API_BASE}/filter.php`, {
        params: { i: ingredient },
      });
      return response.data.meals || [];
    } catch (error) {
      console.error('Error searching by ingredient:', error);
      return [];
    }
  },

  // Get recipe by ID
  getRecipeById: async (id: string): Promise<Recipe | null> => {
    try {
      const response = await axios.get(`${MEALDB_API_BASE}/lookup.php`, {
        params: { i: id },
      });
      return response.data.meals?.[0] || null;
    } catch (error) {
      console.error('Error getting recipe by ID:', error);
      return null;
    }
  },

  // Get random recipes
  getRandomRecipes: async (count: number = 10): Promise<Recipe[]> => {
    const recipes: Recipe[] = [];
    try {
      for (let i = 0; i < count; i++) {
        const response = await axios.get(`${MEALDB_API_BASE}/random.php`);
        if (response.data.meals?.[0]) {
          recipes.push(response.data.meals[0]);
        }
      }
    } catch (error) {
      console.error('Error getting random recipes:', error);
    }
    return recipes;
  },
};
