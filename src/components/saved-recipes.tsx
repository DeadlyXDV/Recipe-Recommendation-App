import { useState, useEffect } from 'react';
import { ArrowLeft, Bookmark, Loader2, Trash2, Eye } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useAuth } from '../contexts/auth-context';

interface SavedRecipesProps {
  onBack: () => void;
  onViewDetail: (recipeId: string) => void;
}

interface SavedRecipeData {
  id: string;
  name: string;
  image: string;
  category: string;
  area: string;
}

export function SavedRecipes({ onBack, onViewDetail }: SavedRecipesProps) {
  const { savedRecipes, unsaveRecipe } = useAuth();
  const [recipesData, setRecipesData] = useState<SavedRecipeData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSavedRecipes = async () => {
      setIsLoading(true);
      try {
        const recipes: SavedRecipeData[] = [];
        
        // Fetch details for each saved recipe
        for (const recipeId of savedRecipes) {
          try {
            const response = await fetch(
              `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${recipeId}`
            );
            const data = await response.json();
            
            if (data.meals && data.meals[0]) {
              const meal = data.meals[0];
              recipes.push({
                id: meal.idMeal,
                name: meal.strMeal,
                image: meal.strMealThumb,
                category: meal.strCategory,
                area: meal.strArea,
              });
            }
          } catch (error) {
            console.error(`Error fetching recipe ${recipeId}:`, error);
          }
        }
        
        setRecipesData(recipes);
      } catch (error) {
        console.error('Error fetching saved recipes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (savedRecipes.length > 0) {
      fetchSavedRecipes();
    } else {
      setIsLoading(false);
      setRecipesData([]);
    }
  }, [savedRecipes]);

  const handleUnsave = (recipeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    unsaveRecipe(recipeId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      {/* Header */}
      <header className="bg-white border-b border-orange-100 shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={onBack}
                variant="outline"
                className="border-orange-300 text-orange-700 hover:bg-orange-50"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Kembali
              </Button>
              <div className="flex items-center gap-3">
                <div className="bg-orange-500 p-2 rounded-lg">
                  <Bookmark className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl text-orange-900">Resep Tersimpan</h1>
                  <p className="text-sm text-orange-600">
                    {savedRecipes.length} resep disimpan
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 text-orange-500 animate-spin mb-4" />
              <p className="text-orange-700">Memuat resep tersimpan...</p>
            </div>
          ) : recipesData.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg border border-orange-100 p-12">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="bg-orange-100 p-6 rounded-full mb-6">
                  <Bookmark className="w-16 h-16 text-orange-500" />
                </div>
                <h2 className="mb-3 text-orange-900">Belum Ada Resep Tersimpan</h2>
                <p className="text-orange-600 max-w-md mb-6">
                  Anda belum menyimpan resep apapun. Cari resep yang Anda suka dan klik tombol
                  bookmark untuk menyimpannya di sini.
                </p>
                <Button
                  onClick={onBack}
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                >
                  Cari Resep
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recipesData.map((recipe) => (
                <Card
                  key={recipe.id}
                  className="overflow-hidden hover:shadow-xl transition-all border-orange-100 cursor-pointer group"
                >
                  <div className="relative h-48">
                    <ImageWithFallback
                      src={recipe.image}
                      alt={recipe.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    
                    {/* Action Buttons on Hover */}
                    <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        onClick={() => onViewDetail(recipe.id)}
                        className="bg-orange-500 hover:bg-orange-600 text-white shadow-lg"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Lihat Detail
                      </Button>
                    </div>

                    {/* Delete Button */}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={(e) => handleUnsave(recipe.id, e)}
                      className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <CardHeader>
                    <CardTitle className="text-orange-900 text-lg line-clamp-2">
                      {recipe.name}
                    </CardTitle>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant="outline" className="border-orange-300 text-orange-700">
                        {recipe.category}
                      </Badge>
                      <Badge variant="outline" className="border-orange-300 text-orange-700">
                        {recipe.area}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => onViewDetail(recipe.id)}
                        variant="outline"
                        className="flex-1 border-orange-300 text-orange-700 hover:bg-orange-50"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Detail
                      </Button>
                      <Button
                        onClick={(e) => handleUnsave(recipe.id, e)}
                        variant="outline"
                        className="border-red-300 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 py-8 bg-white border-t border-orange-100">
        <div className="container mx-auto px-4 text-center text-sm text-orange-600">
          <p>Powered by TheMealDB API</p>
        </div>
      </footer>
    </div>
  );
}
