import { useState, useEffect } from 'react';
import { Sparkles, ChefHat } from 'lucide-react';
import { RecipeCard } from './recipe-card';
import { recipeAPI } from '../lib/api';
import { useAuth } from '../contexts/auth-context';
import { Recipe } from '../App';

interface RecommendedRecipe {
  id: string;
  name: string;
  image: string;
  score: number;
  matchType: 'category' | 'area' | 'both';
}

interface RecommendedRecipesProps {
  onRecipeClick: (recipeId: string) => void;
}

export function RecommendedRecipes({ onRecipeClick }: RecommendedRecipesProps) {
  const [recommendations, setRecommendations] = useState<RecommendedRecipe[]>([]);
  const [recipesData, setRecipesData] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Fetch recommendation IDs
        const response = await recipeAPI.getRecommendations();
        if (response.success && response.data.length > 0) {
          setRecommendations(response.data);
          
          // Fetch full recipe details for each recommendation
          const recipePromises = response.data.map(async (rec: RecommendedRecipe) => {
            try {
              const recipeResponse = await fetch(
                `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${rec.id}`
              );
              const recipeData = await recipeResponse.json();
              
              if (recipeData.meals && recipeData.meals[0]) {
                const meal = recipeData.meals[0];
                
                // Extract ingredients
                const ingredients: string[] = [];
                for (let i = 1; i <= 20; i++) {
                  const ingredient = meal[`strIngredient${i}`];
                  const measure = meal[`strMeasure${i}`];
                  if (ingredient && ingredient.trim()) {
                    ingredients.push(`${measure ? measure.trim() + ' ' : ''}${ingredient.trim()}`);
                  }
                }

                return {
                  id: meal.idMeal,
                  name: meal.strMeal,
                  image: meal.strMealThumb,
                  description: meal.strInstructions || '',
                  ingredients,
                  similarityScore: rec.score,
                  cookTime: '',
                  difficulty: '',
                  matchType: rec.matchType,
                };
              }
              return null;
            } catch (err) {
              console.error(`Error fetching recipe ${rec.id}:`, err);
              return null;
            }
          });

          const recipes = await Promise.all(recipePromises);
          const validRecipes = recipes.filter((r): r is Recipe & { matchType: string } => r !== null);
          setRecipesData(validRecipes);
        } else {
          setRecommendations([]);
          setRecipesData([]);
        }
      } catch (err) {
        console.error('Error fetching recommendations:', err);
        setError('Terjadi kesalahan saat memuat rekomendasi');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  }, [user]);

  // Don't show if user is not logged in
  if (!user) {
    return null;
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="w-full">
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-orange-900" />
            <h2 className="text-orange-900">Resep Untuk Anda</h2>
          </div>
        </div>
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl shadow-lg border border-orange-100 p-6 h-48 animate-pulse"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="w-full">
        <div className="bg-white rounded-2xl shadow-lg border border-orange-100 p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <Sparkles className="w-16 h-16 text-orange-300 mb-4" />
            <p className="text-orange-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (recipesData.length === 0) {
    return (
      <div className="w-full">
        <div className="bg-white rounded-2xl shadow-lg border border-orange-100 p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="bg-orange-100 p-6 rounded-full mb-6">
              <ChefHat className="w-16 h-16 text-orange-500" />
            </div>
            <h2 className="mb-3 text-orange-900">Belum Ada Rekomendasi</h2>
            <p className="text-orange-600 max-w-md">
              Like atau simpan resep untuk mendapatkan rekomendasi personal!
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Main content
  return (
    <div className="w-full">
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-orange-900" />
          <h2 className="text-orange-900">Resep Untuk Anda</h2>
        </div>
        <p className="text-orange-600 mt-2">
          Ditemukan {recipesData.length} resep berdasarkan preferensi Anda
        </p>
      </div>

      <div className="space-y-6">
        {recipesData.map((recipe) => (
          <div key={recipe.id} className="relative">
            <RecipeCard
              recipe={recipe}
              onViewDetail={() => onRecipeClick(recipe.id)}
            />
            {/* Match type badge */}
            <div className="absolute top-4 right-4 z-10">
              <span className="inline-block px-3 py-1.5 text-xs font-medium rounded-full bg-orange-500 text-white shadow-md">
                {(recipe as any).matchType === 'both'
                  ? '🎯 Sangat Cocok'
                  : (recipe as any).matchType === 'category'
                  ? '📂 Kategori Favorit'
                  : '🌍 Area Favorit'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
