import { useState } from 'react';
import { IngredientSelector } from './components/ingredient-selector';
import { RecipeResults } from './components/recipe-results';
import { RecipeDetail } from './components/recipe-detail';
import { SavedRecipes } from './components/saved-recipes';
import { Search, ChefHat, LogIn, LogOut, User, Bookmark, Filter } from 'lucide-react';
import { Button } from './components/ui/button';
import { LoginModal } from './components/auth/login-modal';
import { SignupModal } from './components/auth/signup-modal';
import { AuthProvider, useAuth } from './contexts/auth-context';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './components/ui/dropdown-menu';

// Type definitions
export interface Recipe {
  id: string;
  name: string;
  description: string;
  ingredients: string[];
  similarityScore: number;
  cookTime: string;
  difficulty: string;
  image: string;
  category?: string;
  area?: string;
  instructions?: string;
}

interface MealDBMeal {
  idMeal: string;
  strMeal: string;
  strCategory: string;
  strArea: string;
  strInstructions: string;
  strMealThumb: string;
  [key: string]: string;
}

interface HeaderAuthContentProps {
  onViewSaved: () => void;
}

function HeaderAuthContent({ onViewSaved }: HeaderAuthContentProps) {
  const [loginOpen, setLoginOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);
  const { user, logout, savedRecipes } = useAuth();

  if (!user) {
    return (
      <>
        <Button
          onClick={() => setLoginOpen(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white"
        >
          <LogIn className="w-4 h-4 mr-2" />
          Masuk
        </Button>
        <LoginModal
          open={loginOpen}
          onOpenChange={setLoginOpen}
          onSwitchToSignup={() => {
            setLoginOpen(false);
            setSignupOpen(true);
          }}
        />
        <SignupModal
          open={signupOpen}
          onOpenChange={setSignupOpen}
          onSwitchToLogin={() => {
            setSignupOpen(false);
            setLoginOpen(true);
          }}
        />
      </>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Button
        onClick={onViewSaved}
        variant="outline"
        className="hidden sm:flex items-center gap-2 border-orange-300 text-orange-700 hover:bg-orange-50"
      >
        <Bookmark className="w-4 h-4" />
        <span>{savedRecipes.length} resep tersimpan</span>
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="border-orange-300 text-orange-700">
            <User className="w-4 h-4 mr-2" />
            {user.name}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Akun Saya</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <User className="w-4 h-4 mr-2" />
            <span>{user.email}</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onViewSaved}>
            <Bookmark className="w-4 h-4 mr-2" />
            <span>{savedRecipes.length} Resep Tersimpan</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={logout} className="text-red-600">
            <LogOut className="w-4 h-4 mr-2" />
            <span>Keluar</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function AppContent() {
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [ingredientModalOpen, setIngredientModalOpen] = useState(false);
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'home' | 'saved'>('home');

  const getMealDetails = async (mealId: string): Promise<MealDBMeal | null> => {
    try {
      const response = await fetch(
        `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.meals ? data.meals[0] : null;
    } catch (error) {
      console.error(`Error fetching meal ${mealId}:`, error);
      return null;
    }
  };

  const extractIngredients = (meal: MealDBMeal): string[] => {
    const ingredients: string[] = [];
    for (let i = 1; i <= 20; i++) {
      const ingredient = meal[`strIngredient${i}`];
      if (ingredient && ingredient.trim()) {
        ingredients.push(ingredient.toLowerCase().trim());
      }
    }
    return ingredients;
  };

  const calculateSimilarity = (
    recipeIngredients: string[],
    selectedIngredients: string[]
  ): number => {
    const matches = recipeIngredients.filter(ing =>
      selectedIngredients.some(selected =>
        ing.includes(selected) || selected.includes(ing)
      )
    ).length;

    // Calculate score based on matches
    const score = (matches / selectedIngredients.length) * 100;
    return Math.round(score);
  };

  // Batch process requests to avoid overwhelming the API
  const batchFetch = async <T,>(
    items: T[],
    fetchFn: (item: T) => Promise<any>,
    batchSize: number = 5
  ): Promise<any[]> => {
    const results: any[] = [];
    
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(item => fetchFn(item))
      );
      results.push(...batchResults);
      
      // Small delay between batches to avoid rate limiting
      if (i + batchSize < items.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    return results;
  };

  const handleSearch = async () => {
    if (selectedIngredients.length === 0) {
      return;
    }

    setIsLoading(true);
    setHasSearched(true);
    setIngredientModalOpen(false); // Close modal when searching
    setSelectedRecipeId(null); // Reset selected recipe when searching

    try {
      // Fetch meals for each selected ingredient
      const allMealIds = new Set<string>();
      
      for (const ingredient of selectedIngredients) {
        try {
          const response = await fetch(
            `https://www.themealdb.com/api/json/v1/1/filter.php?i=${ingredient}`
          );
          
          if (!response.ok) {
            console.warn(`Failed to fetch meals for ${ingredient}`);
            continue;
          }
          
          const data = await response.json();
          
          if (data.meals) {
            data.meals.forEach((meal: { idMeal: string }) => {
              allMealIds.add(meal.idMeal);
            });
          }
          
          // Small delay between ingredient searches
          await new Promise(resolve => setTimeout(resolve, 50));
        } catch (error) {
          console.error(`Error searching for ${ingredient}:`, error);
        }
      }

      if (allMealIds.size === 0) {
        setRecipes([]);
        setIsLoading(false);
        return;
      }

      // Limit to 20 meals to avoid too many requests
      const limitedMealIds = Array.from(allMealIds).slice(0, 20);

      // Get detailed information for each meal with batching
      const mealDetails = await batchFetch(
        limitedMealIds,
        getMealDetails,
        5 // Process 5 at a time
      );

      // Process and score recipes
      const processedRecipes: Recipe[] = mealDetails
        .filter((meal): meal is MealDBMeal => meal !== null)
        .map(meal => {
          const recipeIngredients = extractIngredients(meal);
          const similarityScore = calculateSimilarity(
            recipeIngredients,
            selectedIngredients
          );

          return {
            id: meal.idMeal,
            name: meal.strMeal,
            description: meal.strInstructions.slice(0, 150) + '...',
            ingredients: recipeIngredients,
            similarityScore,
            cookTime: '30-45 min', // TheMealDB doesn't provide cook time
            difficulty: 'Medium',
            image: meal.strMealThumb,
            category: meal.strCategory,
            area: meal.strArea,
            instructions: meal.strInstructions,
          };
        })
        .filter(recipe => recipe.similarityScore > 0)
        .sort((a, b) => b.similarityScore - a.similarityScore)
        .slice(0, 10); // Limit to top 10 results

      setRecipes(processedRecipes);
    } catch (error) {
      console.error('Error fetching recipes:', error);
      setRecipes([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-orange-50 via-white to-amber-50">
      {/* Conditional Rendering based on view */}
      {selectedRecipeId ? (
        <RecipeDetail 
          recipeId={selectedRecipeId} 
          onBack={() => setSelectedRecipeId(null)} 
        />
      ) : currentView === 'saved' ? (
        <SavedRecipes 
          onBack={() => setCurrentView('home')}
          onViewDetail={(recipeId) => setSelectedRecipeId(recipeId)}
        />
      ) : (
        <>
          {/* Header */}
          <header className="bg-white border-b border-orange-100 shadow-sm">
            <div className="container mx-auto px-4 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-orange-500 p-3 rounded-xl">
                    <ChefHat className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-orange-900">Recipe Finder</h1>
                    <p className="text-sm text-orange-600">Temukan resep dari bahan yang Anda punya</p>
                  </div>
                </div>
                <HeaderAuthContent onViewSaved={() => setCurrentView('saved')} />
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-grow container mx-auto px-4 py-8">
            {/* Action Bar */}
            <div className="mb-6 flex items-center justify-between bg-white rounded-xl shadow-sm border border-orange-100 p-4">
              <div className="flex items-center gap-3">
                <Filter className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="text-sm text-orange-600">Bahan dipilih</p>
                  <p className="font-semibold text-orange-900">{selectedIngredients.length} bahan</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => setIngredientModalOpen(true)}
                  variant="outline"
                  className="border-orange-300 text-orange-700 hover:bg-orange-50"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Pilih Bahan
                </Button>
                <Button
                  onClick={handleSearch}
                  disabled={selectedIngredients.length === 0 || isLoading}
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                >
                  <Search className="w-4 h-4 mr-2" />
                  {isLoading ? 'Mencari...' : 'Cari Resep'}
                </Button>
              </div>
            </div>

            {/* Recipe Results - Full Width */}
            <RecipeResults
              recipes={recipes}
              isLoading={isLoading}
              hasSearched={hasSearched}
              selectedIngredients={selectedIngredients}
              onViewDetail={(recipeId) => setSelectedRecipeId(recipeId)}
            />
          </main>

          {/* Footer */}
          <footer className="mt-auto py-8 bg-white border-t border-orange-100">
            <div className="container mx-auto px-4 text-center text-sm text-orange-600">
              <p>Powered by TheMealDB API</p>
            </div>
          </footer>
        </>
      )}

      {/* Ingredient Modal */}
      <Dialog open={ingredientModalOpen} onOpenChange={setIngredientModalOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-orange-900">Pilih Bahan-Bahan</DialogTitle>
            <DialogDescription className="text-orange-600">
              Pilih bahan yang Anda miliki untuk menemukan resep yang cocok
            </DialogDescription>
          </DialogHeader>
          
          <div className="my-4">
            <IngredientSelector
              selectedIngredients={selectedIngredients}
              onSelectionChange={setSelectedIngredients}
            />
          </div>

          <DialogFooter className="flex items-center justify-between gap-4 sm:justify-between">
            <div className="flex items-center gap-2 text-sm text-orange-700">
              <span>Dipilih:</span>
              <span className="px-3 py-1 bg-orange-100 text-orange-900 rounded-full">
                {selectedIngredients.length} bahan
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setIngredientModalOpen(false)}
              >
                Tutup
              </Button>
              <Button
                onClick={handleSearch}
                disabled={selectedIngredients.length === 0}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                <Search className="w-4 h-4 mr-2" />
                Cari Resep
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;