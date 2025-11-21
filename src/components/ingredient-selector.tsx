import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { ScrollArea } from './ui/scroll-area';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

// Manual category mapping for hybrid approach
const CATEGORY_MAPPING: { [key: string]: string } = {
  // Protein - Meat
  'chicken': 'Protein',
  'chicken breast': 'Protein',
  'chicken thighs': 'Protein',
  'beef': 'Protein',
  'ground beef': 'Protein',
  'beef steak': 'Protein',
  'pork': 'Protein',
  'pork chops': 'Protein',
  'bacon': 'Protein',
  'sausages': 'Protein',
  'lamb': 'Protein',
  'lamb mince': 'Protein',
  'duck': 'Protein',
  'turkey': 'Protein',
  'eggs': 'Protein',
  'tofu': 'Protein',
  'minced beef': 'Protein',
  'ground pork': 'Protein',
  'beef brisket': 'Protein',
  'beef fillet': 'Protein',
  'chicken legs': 'Protein',
  'goat meat': 'Protein',
  'pork belly': 'Protein',
  'veal': 'Protein',
  
  // Seafood
  'salmon': 'Seafood',
  'tuna': 'Seafood',
  'cod': 'Seafood',
  'haddock': 'Seafood',
  'sea bass': 'Seafood',
  'prawns': 'Seafood',
  'shrimp': 'Seafood',
  'lobster': 'Seafood',
  'crab': 'Seafood',
  'mussels': 'Seafood',
  'clams': 'Seafood',
  'squid': 'Seafood',
  'anchovies': 'Seafood',
  'monkfish': 'Seafood',
  'mackerel': 'Seafood',
  'sea bream': 'Seafood',
  'red snapper': 'Seafood',
  'scallops': 'Seafood',
  'sardines': 'Seafood',
  'trout': 'Seafood',
  
  // Dairy
  'cheese': 'Dairy',
  'cheddar cheese': 'Dairy',
  'parmesan': 'Dairy',
  'parmesan cheese': 'Dairy',
  'mozzarella': 'Dairy',
  'feta': 'Dairy',
  'cream cheese': 'Dairy',
  'butter': 'Dairy',
  'milk': 'Dairy',
  'cream': 'Dairy',
  'double cream': 'Dairy',
  'single cream': 'Dairy',
  'heavy cream': 'Dairy',
  'sour cream': 'Dairy',
  'yogurt': 'Dairy',
  'greek yogurt': 'Dairy',
  'ricotta': 'Dairy',
  'gruyère': 'Dairy',
  'monterey jack': 'Dairy',
  'goats cheese': 'Dairy',
  'mascarpone': 'Dairy',
  
  // Grains
  'rice': 'Grains',
  'basmati rice': 'Grains',
  'jasmine rice': 'Grains',
  'pasta': 'Grains',
  'spaghetti': 'Grains',
  'penne': 'Grains',
  'linguine': 'Grains',
  'fettuccine': 'Grains',
  'rigatoni': 'Grains',
  'lasagne sheets': 'Grains',
  'noodles': 'Grains',
  'egg noodles': 'Grains',
  'rice noodles': 'Grains',
  'flour': 'Grains',
  'plain flour': 'Grains',
  'self-raising flour': 'Grains',
  'bread': 'Grains',
  'breadcrumbs': 'Grains',
  'tortillas': 'Grains',
  'couscous': 'Grains',
  'quinoa': 'Grains',
  'bulgur wheat': 'Grains',
  'wild rice': 'Grains',
  'arborio rice': 'Grains',
  'orzo': 'Grains',
  
  // Vegetables
  'potatoes': 'Vegetables',
  'potato': 'Vegetables',
  'sweet potato': 'Vegetables',
  'tomatoes': 'Vegetables',
  'tomato': 'Vegetables',
  'cherry tomatoes': 'Vegetables',
  'plum tomatoes': 'Vegetables',
  'tinned tomatos': 'Vegetables',
  'chopped tomatoes': 'Vegetables',
  'onions': 'Vegetables',
  'onion': 'Vegetables',
  'red onion': 'Vegetables',
  'spring onions': 'Vegetables',
  'shallots': 'Vegetables',
  'garlic': 'Vegetables',
  'garlic clove': 'Vegetables',
  'carrots': 'Vegetables',
  'carrot': 'Vegetables',
  'celery': 'Vegetables',
  'mushrooms': 'Vegetables',
  'mushroom': 'Vegetables',
  'peppers': 'Vegetables',
  'red pepper': 'Vegetables',
  'green pepper': 'Vegetables',
  'yellow pepper': 'Vegetables',
  'bell pepper': 'Vegetables',
  'chili': 'Vegetables',
  'red chili': 'Vegetables',
  'red chilli': 'Vegetables',
  'green chili': 'Vegetables',
  'green chilli': 'Vegetables',
  'spinach': 'Vegetables',
  'kale': 'Vegetables',
  'broccoli': 'Vegetables',
  'cauliflower': 'Vegetables',
  'cabbage': 'Vegetables',
  'red cabbage': 'Vegetables',
  'zucchini': 'Vegetables',
  'courgettes': 'Vegetables',
  'eggplant': 'Vegetables',
  'aubergine': 'Vegetables',
  'leek': 'Vegetables',
  'asparagus': 'Vegetables',
  'green beans': 'Vegetables',
  'peas': 'Vegetables',
  'sweetcorn': 'Vegetables',
  'corn': 'Vegetables',
  'cucumber': 'Vegetables',
  'lettuce': 'Vegetables',
  'avocado': 'Vegetables',
  'beetroot': 'Vegetables',
  'pumpkin': 'Vegetables',
  'butternut squash': 'Vegetables',
  'fennel': 'Vegetables',
  'fennel bulb': 'Vegetables',
  'radish': 'Vegetables',
  'turnip': 'Vegetables',
  'swede': 'Vegetables',
  'parsnip': 'Vegetables',
  'water chestnut': 'Vegetables',
  'baby plum tomatoes': 'Vegetables',
  
  // Legumes
  'chickpeas': 'Legumes',
  'lentils': 'Legumes',
  'red lentils': 'Legumes',
  'green lentils': 'Legumes',
  'black beans': 'Legumes',
  'kidney beans': 'Legumes',
  'cannellini beans': 'Legumes',
  'black eyed peas': 'Legumes',
  'pinto beans': 'Legumes',
  'butter beans': 'Legumes',
  'lima beans': 'Legumes',
  'flageolet beans': 'Legumes',
  'haricot beans': 'Legumes',
  'borlotti beans': 'Legumes',
  
  // Nuts & Seeds
  'almonds': 'Nuts & Seeds',
  'cashews': 'Nuts & Seeds',
  'cashew nuts': 'Nuts & Seeds',
  'peanuts': 'Nuts & Seeds',
  'peanut butter': 'Nuts & Seeds',
  'walnuts': 'Nuts & Seeds',
  'pine nuts': 'Nuts & Seeds',
  'pecans': 'Nuts & Seeds',
  'pecan nuts': 'Nuts & Seeds',
  'sesame seeds': 'Nuts & Seeds',
  'sesame seed': 'Nuts & Seeds',
  'sunflower seeds': 'Nuts & Seeds',
  'pumpkin seeds': 'Nuts & Seeds',
  'flaked almonds': 'Nuts & Seeds',
  'ground almonds': 'Nuts & Seeds',
  'hazelnuts': 'Nuts & Seeds',
  'pistachios': 'Nuts & Seeds',
  'chestnuts': 'Nuts & Seeds',
  
  // Herbs
  'basil': 'Herbs',
  'parsley': 'Herbs',
  'flat leaf parsley': 'Herbs',
  'cilantro': 'Herbs',
  'coriander': 'Herbs',
  'coriander leaves': 'Herbs',
  'fresh coriander': 'Herbs',
  'mint': 'Herbs',
  'thyme': 'Herbs',
  'rosemary': 'Herbs',
  'oregano': 'Herbs',
  'dill': 'Herbs',
  'bay leaf': 'Herbs',
  'bay leaves': 'Herbs',
  'sage': 'Herbs',
  'tarragon': 'Herbs',
  'chives': 'Herbs',
  
  // Spices
  'cumin': 'Spices',
  'cumin seeds': 'Spices',
  'ground cumin': 'Spices',
  'paprika': 'Spices',
  'turmeric': 'Spices',
  'curry powder': 'Spices',
  'garam masala': 'Spices',
  'cinnamon': 'Spices',
  'nutmeg': 'Spices',
  'ginger': 'Spices',
  'ground ginger': 'Spices',
  'black pepper': 'Spices',
  'chili powder': 'Spices',
  'chilli powder': 'Spices',
  'cayenne pepper': 'Spices',
  'red pepper flakes': 'Spices',
  'cardamom': 'Spices',
  'cloves': 'Spices',
  'star anise': 'Spices',
  'fennel seeds': 'Spices',
  'mustard seeds': 'Spices',
  'coriander seeds': 'Spices',
  'allspice': 'Spices',
  'chinese five spice': 'Spices',
  'saffron': 'Spices',
  'vanilla': 'Spices',
  'vanilla extract': 'Spices',
  
  // Sauces & Oils
  'olive oil': 'Sauces & Oils',
  'vegetable oil': 'Sauces & Oils',
  'sesame oil': 'Sauces & Oils',
  'coconut oil': 'Sauces & Oils',
  'sunflower oil': 'Sauces & Oils',
  'coconut milk': 'Sauces & Oils',
  'coconut cream': 'Sauces & Oils',
  'soy sauce': 'Sauces & Oils',
  'fish sauce': 'Sauces & Oils',
  'oyster sauce': 'Sauces & Oils',
  'tomato puree': 'Sauces & Oils',
  'tomato ketchup': 'Sauces & Oils',
  'tomato sauce': 'Sauces & Oils',
  'passata': 'Sauces & Oils',
  'worcestershire sauce': 'Sauces & Oils',
  'tabasco': 'Sauces & Oils',
  'vinegar': 'Sauces & Oils',
  'balsamic vinegar': 'Sauces & Oils',
  'red wine vinegar': 'Sauces & Oils',
  'white wine vinegar': 'Sauces & Oils',
  'rice vinegar': 'Sauces & Oils',
  'cider vinegar': 'Sauces & Oils',
  'apple cider vinegar': 'Sauces & Oils',
  'honey': 'Sauces & Oils',
  'sugar': 'Sauces & Oils',
  'caster sugar': 'Sauces & Oils',
  'brown sugar': 'Sauces & Oils',
  'icing sugar': 'Sauces & Oils',
  'mustard': 'Sauces & Oils',
  'dijon mustard': 'Sauces & Oils',
  'english mustard': 'Sauces & Oils',
  'wholegrain mustard': 'Sauces & Oils',
  'mayonnaise': 'Sauces & Oils',
  'ketchup': 'Sauces & Oils',
  'hoisin sauce': 'Sauces & Oils',
  'hot sauce': 'Sauces & Oils',
  'sriracha': 'Sauces & Oils',
  'chili sauce': 'Sauces & Oils',
  'sweet chilli sauce': 'Sauces & Oils',
  'tomato pasta sauce': 'Sauces & Oils',
  'marinara sauce': 'Sauces & Oils',
  
  // Fruits
  'lemon': 'Fruits',
  'lime': 'Fruits',
  'orange': 'Fruits',
  'apple': 'Fruits',
  'banana': 'Fruits',
  'strawberries': 'Fruits',
  'blueberries': 'Fruits',
  'raspberries': 'Fruits',
  'mango': 'Fruits',
  'pineapple': 'Fruits',
  'coconut': 'Fruits',
  'dates': 'Fruits',
  'raisins': 'Fruits',
  'sultanas': 'Fruits',
  'cranberries': 'Fruits',
  'apricot': 'Fruits',
  'peach': 'Fruits',
  'pear': 'Fruits',
  'plum': 'Fruits',
  'cherry': 'Fruits',
  'melon': 'Fruits',
  'watermelon': 'Fruits',
  'grapes': 'Fruits',
  'kiwi': 'Fruits',
  'passion fruit': 'Fruits',
  'papaya': 'Fruits',
  'pomegranate': 'Fruits',
  'fig': 'Fruits',
  
  // Wine & Spirits (for cooking)
  'red wine': 'Wine & Spirits',
  'white wine': 'Wine & Spirits',
  'brandy': 'Wine & Spirits',
  'rum': 'Wine & Spirits',
  'dark rum': 'Wine & Spirits',
  'vodka': 'Wine & Spirits',
  'sherry': 'Wine & Spirits',
  'port': 'Wine & Spirits',
  'vermouth': 'Wine & Spirits',
  'tequila': 'Wine & Spirits',
};

const CATEGORIES = [
  'Protein',
  'Seafood', 
  'Dairy',
  'Grains',
  'Vegetables',
  'Legumes',
  'Nuts & Seeds',
  'Herbs',
  'Spices',
  'Sauces & Oils',
  'Fruits',
  'Wine & Spirits'
];

interface Ingredient {
  id: string;
  name: string;
  category: string;
}

interface IngredientSelectorProps {
  selectedIngredients: string[];
  onSelectionChange: (ingredients: string[]) => void;
}

export function IngredientSelector({
  selectedIngredients,
  onSelectionChange,
}: IngredientSelectorProps) {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          'https://www.themealdb.com/api/json/v1/1/list.php?i=list'
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch ingredients');
        }
        
        const data = await response.json();
        
        // Map ingredients with categories
        const categorizedIngredients: Ingredient[] = data.meals
          .map((meal: { strIngredient: string }) => {
            const ingredientName = meal.strIngredient;
            const ingredientLower = ingredientName.toLowerCase();
            const category = CATEGORY_MAPPING[ingredientLower];
            
            // Only include ingredients that have a category mapping
            if (category) {
              return {
                id: ingredientLower,
                name: ingredientName,
                category: category,
              };
            }
            return null;
          })
          .filter((ing: Ingredient | null): ing is Ingredient => ing !== null)
          .sort((a, b) => a.name.localeCompare(b.name));
        
        setIngredients(categorizedIngredients);
      } catch (error) {
        console.error('Error fetching ingredients:', error);
        // Fallback to empty array on error
        setIngredients([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchIngredients();
  }, []);

  const handleToggle = (ingredientId: string) => {
    if (selectedIngredients.includes(ingredientId)) {
      onSelectionChange(selectedIngredients.filter(id => id !== ingredientId));
    } else {
      onSelectionChange([...selectedIngredients, ingredientId]);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500 mx-auto mb-3" />
          <p className="text-sm text-orange-600">Memuat daftar bahan...</p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[500px] pr-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {CATEGORIES.map(category => {
          const categoryIngredients = ingredients.filter(
            ing => ing.category === category
          );

          if (categoryIngredients.length === 0) return null;

          return (
            <div key={category}>
              <h3 className="mb-3 text-orange-800 sticky top-0 bg-white/95 backdrop-blur-sm py-2 -mt-2">{category}</h3>
              <div className="space-y-3">
                {categoryIngredients.map(ingredient => (
                  <div key={ingredient.id} className="flex items-center space-x-3">
                    <Checkbox
                      id={ingredient.id}
                      checked={selectedIngredients.includes(ingredient.id)}
                      onCheckedChange={() => handleToggle(ingredient.id)}
                      className="data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                    />
                    <Label
                      htmlFor={ingredient.id}
                      className="cursor-pointer hover:text-orange-700 transition-colors"
                    >
                      {ingredient.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}