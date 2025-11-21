import { useState, useEffect } from 'react';
import { ArrowLeft, Clock, ChefHat, Globe, Bookmark, BookmarkCheck, ExternalLink } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useAuth } from '../contexts/auth-context';

interface RecipeDetailProps {
  recipeId: string;
  onBack: () => void;
}

interface MealDetail {
  idMeal: string;
  strMeal: string;
  strCategory: string;
  strArea: string;
  strInstructions: string;
  strMealThumb: string;
  strYoutube?: string;
  strTags?: string;
  [key: string]: string | undefined;
}

export function RecipeDetail({ recipeId, onBack }: RecipeDetailProps) {
  const [meal, setMeal] = useState<MealDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user, saveRecipe, unsaveRecipe, isRecipeSaved } = useAuth();
  const isSaved = isRecipeSaved(recipeId);

  useEffect(() => {
    const fetchRecipeDetail = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${recipeId}`
        );
        const data = await response.json();
        if (data.meals && data.meals[0]) {
          setMeal(data.meals[0]);
        }
      } catch (error) {
        console.error('Error fetching recipe detail:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecipeDetail();
  }, [recipeId]);

  const handleSaveClick = () => {
    if (!user) {
      alert('Silakan login terlebih dahulu untuk menyimpan resep');
      return;
    }

    if (isSaved) {
      unsaveRecipe(recipeId);
    } else {
      saveRecipe(recipeId);
    }
  };

  const getIngredients = (meal: MealDetail): Array<{ ingredient: string; measure: string }> => {
    const ingredients: Array<{ ingredient: string; measure: string }> = [];
    for (let i = 1; i <= 20; i++) {
      const ingredient = meal[`strIngredient${i}`];
      const measure = meal[`strMeasure${i}`];
      if (ingredient && ingredient.trim()) {
        ingredients.push({
          ingredient: ingredient.trim(),
          measure: measure?.trim() || '',
        });
      }
    }
    return ingredients;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-amber-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500 mx-auto mb-4"></div>
          <p className="text-orange-600">Memuat detail resep...</p>
        </div>
      </div>
    );
  }

  if (!meal) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-amber-50">
        <div className="text-center">
          <p className="text-orange-600 mb-4">Resep tidak ditemukan</p>
          <Button onClick={onBack} variant="outline" className="border-orange-300 text-orange-700">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Button>
        </div>
      </div>
    );
  }

  const ingredients = getIngredients(meal);
  const tags = meal.strTags ? meal.strTags.split(',') : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      {/* Header */}
      <header className="bg-white border-b border-orange-100 shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              onClick={onBack}
              variant="outline"
              className="border-orange-300 text-orange-700 hover:bg-orange-50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali ke Hasil
            </Button>
            <Button
              onClick={handleSaveClick}
              className={isSaved ? "bg-orange-500 hover:bg-orange-600 text-white" : "bg-white hover:bg-orange-50 border border-orange-300 text-orange-700"}
            >
              {isSaved ? (
                <>
                  <BookmarkCheck className="w-4 h-4 mr-2" />
                  Tersimpan
                </>
              ) : (
                <>
                  <Bookmark className="w-4 h-4 mr-2" />
                  Simpan Resep
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Hero Image */}
          <div className="relative rounded-2xl overflow-hidden mb-8 shadow-2xl">
            <ImageWithFallback
              src={meal.strMealThumb}
              alt={meal.strMeal}
              className="w-full h-[400px] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
              <h1 className="text-4xl mb-3">{meal.strMeal}</h1>
              <div className="flex flex-wrap gap-3">
                <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30">
                  <Globe className="w-3 h-3 mr-1" />
                  {meal.strArea}
                </Badge>
                <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30">
                  <ChefHat className="w-3 h-3 mr-1" />
                  {meal.strCategory}
                </Badge>
                {tags.map((tag, index) => (
                  <Badge key={index} className="bg-white/20 backdrop-blur-sm text-white border-white/30">
                    {tag.trim()}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Ingredients Section */}
            <div className="lg:col-span-1">
              <Card className="border-orange-100 sticky top-24">
                <CardHeader>
                  <CardTitle className="text-orange-900">Bahan-Bahan</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {ingredients.map((item, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-start p-3 bg-orange-50 rounded-lg border border-orange-100"
                      >
                        <span className="text-orange-900 capitalize flex-1">{item.ingredient}</span>
                        <span className="text-orange-600 text-sm ml-2">{item.measure}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Instructions Section */}
            <div className="lg:col-span-2">
              <Card className="border-orange-100">
                <CardHeader>
                  <CardTitle className="text-orange-900">Cara Memasak</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-orange max-w-none">
                    {meal.strInstructions.split('\n').map((paragraph, index) => {
                      if (!paragraph.trim()) return null;
                      
                      // Check if it's a numbered step
                      const stepMatch = paragraph.match(/^(\d+[\.)]\s*)/);
                      
                      if (stepMatch) {
                        return (
                          <div key={index} className="mb-6 flex gap-4">
                            <div className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center">
                              {stepMatch[1].replace(/[.)\s]/g, '')}
                            </div>
                            <p className="text-gray-700 leading-relaxed pt-1">
                              {paragraph.replace(stepMatch[1], '').trim()}
                            </p>
                          </div>
                        );
                      }
                      
                      return (
                        <p key={index} className="text-gray-700 leading-relaxed mb-4">
                          {paragraph}
                        </p>
                      );
                    })}
                  </div>

                  {/* YouTube Link */}
                  {meal.strYoutube && (
                    <div className="mt-8 pt-6 border-t border-orange-100">
                      <h4 className="text-orange-900 mb-3">Video Tutorial</h4>
                      <a
                        href={meal.strYoutube}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Tonton di YouTube
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
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
