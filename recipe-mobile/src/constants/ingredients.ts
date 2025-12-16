export interface Ingredient {
  name: string;
  category: string;
}

export const CATEGORY_MAPPING: { [key: string]: string } = {
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
  'duck': 'Protein',
  'turkey': 'Protein',
  'eggs': 'Protein',
  'tofu': 'Protein',

  // Seafood
  'salmon': 'Seafood',
  'tuna': 'Seafood',
  'cod': 'Seafood',
  'prawns': 'Seafood',
  'shrimp': 'Seafood',
  'lobster': 'Seafood',
  'crab': 'Seafood',
  'mussels': 'Seafood',
  'squid': 'Seafood',

  // Dairy
  'cheese': 'Dairy',
  'cheddar cheese': 'Dairy',
  'parmesan': 'Dairy',
  'mozzarella': 'Dairy',
  'feta': 'Dairy',
  'butter': 'Dairy',
  'milk': 'Dairy',
  'cream': 'Dairy',
  'yogurt': 'Dairy',

  // Grains
  'rice': 'Grains',
  'pasta': 'Grains',
  'spaghetti': 'Grains',
  'noodles': 'Grains',
  'flour': 'Grains',
  'bread': 'Grains',

  // Vegetables
  'tomatoes': 'Vegetables',
  'onions': 'Vegetables',
  'garlic': 'Vegetables',
  'carrots': 'Vegetables',
  'potatoes': 'Vegetables',
  'bell peppers': 'Vegetables',
  'mushrooms': 'Vegetables',
  'spinach': 'Vegetables',
  'broccoli': 'Vegetables',
  'cauliflower': 'Vegetables',
  'lettuce': 'Vegetables',
  'cucumber': 'Vegetables',
  'zucchini': 'Vegetables',
  'eggplant': 'Vegetables',
  'celery': 'Vegetables',

  // Legumes
  'chickpeas': 'Legumes',
  'lentils': 'Legumes',
  'black beans': 'Legumes',
  'kidney beans': 'Legumes',
  'peas': 'Legumes',

  // Nuts & Seeds
  'almonds': 'Nuts & Seeds',
  'walnuts': 'Nuts & Seeds',
  'peanuts': 'Nuts & Seeds',
  'cashews': 'Nuts & Seeds',
  'sesame seeds': 'Nuts & Seeds',
};

export const INGREDIENTS: Ingredient[] = Object.keys(CATEGORY_MAPPING).map((name) => ({
  name,
  category: CATEGORY_MAPPING[name],
}));

export const CATEGORIES = Array.from(new Set(Object.values(CATEGORY_MAPPING)));
