import { Recipe } from '../App';
import { RecipeCard } from './recipe-card';
import { Loader2, Search, ChefHat } from 'lucide-react';

interface RecipeResultsProps {
  recipes: Recipe[];
  isLoading: boolean;
  hasSearched: boolean;
  selectedIngredients: string[];
  onViewDetail?: (recipeId: string) => void;
}

export function RecipeResults({
  recipes,
  isLoading,
  hasSearched,
  selectedIngredients,
  onViewDetail,
}: RecipeResultsProps) {
  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-12 h-12 text-orange-500 animate-spin mb-4" />
        <p className="text-orange-700">Mencari resep yang cocok...</p>
      </div>
    );
  }

  // Empty state - no search yet
  if (!hasSearched) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-orange-100 p-12">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="bg-orange-100 p-6 rounded-full mb-6">
            <ChefHat className="w-16 h-16 text-orange-500" />
          </div>
          <h2 className="mb-3 text-orange-900">Siap Memasak?</h2>
          <p className="text-orange-600 max-w-md">
            Pilih bahan-bahan yang Anda miliki, lalu klik "Cari Resep" untuk menemukan resep yang cocok dengan bahan Anda.
          </p>
        </div>
      </div>
    );
  }

  // Empty state - no results found
  if (recipes.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-orange-100 p-12">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="bg-orange-100 p-6 rounded-full mb-6">
            <Search className="w-16 h-16 text-orange-500" />
          </div>
          <h2 className="mb-3 text-orange-900">Tidak Ada Resep Ditemukan</h2>
          <p className="text-orange-600 max-w-md">
            Maaf, kami tidak menemukan resep yang cocok dengan bahan yang Anda pilih. Coba tambahkan lebih banyak bahan atau pilih kombinasi yang berbeda.
          </p>
        </div>
      </div>
    );
  }

  // Results found
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-orange-900 mb-2">Resep Ditemukan</h2>
        <p className="text-orange-600">
          Ditemukan {recipes.length} resep berdasarkan {selectedIngredients.length} bahan yang Anda pilih
        </p>
      </div>

      <div className="space-y-6">
        {recipes.map(recipe => (
          <RecipeCard key={recipe.id} recipe={recipe} onViewDetail={onViewDetail} />
        ))}
      </div>
    </div>
  );
}