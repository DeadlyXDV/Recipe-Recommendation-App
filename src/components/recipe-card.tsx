import { Recipe } from '../App';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Clock, TrendingUp, ChefHat, Globe, Bookmark, BookmarkCheck, Eye } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useAuth } from '../contexts/auth-context';
import { useState } from 'react';

interface RecipeCardProps {
  recipe: Recipe;
  onViewDetail?: (recipeId: string) => void;
}

export function RecipeCard({ recipe, onViewDetail }: RecipeCardProps) {
  const { user, saveRecipe, unsaveRecipe, isRecipeSaved } = useAuth();
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const isSaved = isRecipeSaved(recipe.id);

  const handleSaveClick = () => {
    if (!user) {
      // If not logged in, could show login modal
      // For now, we'll just show an alert
      alert('Silakan login terlebih dahulu untuk menyimpan resep');
      return;
    }

    if (isSaved) {
      unsaveRecipe(recipe.id);
    } else {
      saveRecipe(recipe.id);
    }
  };

  // Determine score color
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  const getDifficultyColor = (difficulty: string) => {
    if (difficulty === 'Easy' || difficulty === 'Sangat Mudah' || difficulty === 'Mudah') return 'bg-green-100 text-green-700';
    if (difficulty === 'Medium' || difficulty === 'Sedang') return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-shadow border-orange-100">
      <div className="grid md:grid-cols-3 gap-0">
        {/* Image */}
        <div className="relative md:col-span-1 h-48 md:h-auto">
          <ImageWithFallback
            src={recipe.image}
            alt={recipe.name}
            className="w-full h-full object-cover"
          />
          {/* Similarity Score Badge */}
          <div className="absolute top-4 right-4">
            <div className={`${getScoreColor(recipe.similarityScore)} text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2`}>
              <TrendingUp className="w-4 h-4" />
              <span className="font-medium">{recipe.similarityScore}%</span>
            </div>
          </div>
          {/* Save Button */}
          <div className="absolute bottom-4 right-4">
            <Button
              size="sm"
              variant={isSaved ? "default" : "secondary"}
              onClick={handleSaveClick}
              className={isSaved ? "bg-orange-500 hover:bg-orange-600 text-white" : "bg-white hover:bg-orange-50"}
            >
              {isSaved ? (
                <>
                  <BookmarkCheck className="w-4 h-4 mr-1" />
                  Tersimpan
                </>
              ) : (
                <>
                  <Bookmark className="w-4 h-4 mr-1" />
                  Simpan
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="md:col-span-2">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <CardTitle className="text-orange-900 mb-2">{recipe.name}</CardTitle>
                <CardDescription>{recipe.description}</CardDescription>
              </div>
            </div>

            {/* Meta Information */}
            <div className="flex flex-wrap gap-3 mt-4">
              <Badge variant="outline" className="border-orange-300 text-orange-700">
                <Clock className="w-3 h-3 mr-1" />
                {recipe.cookTime}
              </Badge>
              <Badge className={getDifficultyColor(recipe.difficulty)}>
                <ChefHat className="w-3 h-3 mr-1" />
                {recipe.difficulty}
              </Badge>
              {recipe.category && (
                <Badge variant="outline" className="border-orange-300 text-orange-700">
                  {recipe.category}
                </Badge>
              )}
              {recipe.area && (
                <Badge variant="outline" className="border-orange-300 text-orange-700">
                  <Globe className="w-3 h-3 mr-1" />
                  {recipe.area}
                </Badge>
              )}
            </div>
          </CardHeader>

          <CardContent>
            <div>
              <h4 className="text-sm text-orange-900 mb-2">Bahan yang Dibutuhkan:</h4>
              <div className="flex flex-wrap gap-2">
                {recipe.ingredients.slice(0, 8).map((ingredient, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-sm border border-orange-200 capitalize"
                  >
                    {ingredient}
                  </span>
                ))}
                {recipe.ingredients.length > 8 && (
                  <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                    +{recipe.ingredients.length - 8} more
                  </span>
                )}
              </div>
            </div>

            {/* Call to Action */}
            <div className="mt-4 pt-4 border-t border-orange-100">
              <div className="flex items-center justify-between gap-4">
                <p className="text-xs text-orange-600">
                  💡 Resep ini cocok dengan bahan yang Anda miliki dengan tingkat kesesuaian {recipe.similarityScore}%
                </p>
                {onViewDetail && (
                  <Button
                    onClick={() => onViewDetail(recipe.id)}
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Lihat Detail
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </div>
      </div>
    </Card>
  );
}