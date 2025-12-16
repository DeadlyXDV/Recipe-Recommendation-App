import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Search, ChefHat } from 'lucide-react-native';
import { theme } from '../theme';
import { globalStyles } from '../styles/globalStyles';
import { INGREDIENTS, CATEGORIES } from '../constants/ingredients';
import { mealDBApi } from '../services/mealDBApi';
import { Recipe, RecipeWithScore } from '../types/recipe';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function SearchScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [recipes, setRecipes] = useState<RecipeWithScore[]>([]);

  const toggleIngredient = (ingredient: string) => {
    if (selectedIngredients.includes(ingredient)) {
      setSelectedIngredients(selectedIngredients.filter((i) => i !== ingredient));
    } else {
      setSelectedIngredients([...selectedIngredients, ingredient]);
    }
  };

  const searchRecipes = async () => {
    if (selectedIngredients.length === 0) return;

    setIsSearching(true);
    try {
      // Fetch recipes for each selected ingredient
      const allRecipes: Map<string, Recipe> = new Map();

      for (const ingredient of selectedIngredients) {
        const results = await mealDBApi.searchByIngredient(ingredient);
        for (const recipe of results) {
          if (!allRecipes.has(recipe.idMeal)) {
            allRecipes.set(recipe.idMeal, recipe);
          }
        }
        // Small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      // Calculate similarity scores
      const recipesWithScores: RecipeWithScore[] = [];
      for (const recipe of allRecipes.values()) {
        const fullRecipe = await mealDBApi.getRecipeById(recipe.idMeal);
        if (fullRecipe) {
          const recipeIngredients: string[] = [];
          for (let i = 1; i <= 20; i++) {
            const ing = fullRecipe[`strIngredient${i}` as keyof Recipe];
            if (ing && typeof ing === 'string' && ing.trim()) {
              recipeIngredients.push(ing.trim().toLowerCase());
            }
          }

          const matchingCount = selectedIngredients.filter((selected) =>
            recipeIngredients.some((ing) => ing.includes(selected.toLowerCase()))
          ).length;

          const similarityScore = (matchingCount / selectedIngredients.length) * 100;

          recipesWithScores.push({
            ...fullRecipe,
            similarityScore,
          });
        }
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      // Sort by similarity score
      recipesWithScores.sort((a, b) => b.similarityScore - a.similarityScore);
      setRecipes(recipesWithScores);
    } catch (error) {
      console.error('Error searching recipes:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return theme.colors.green500;
    if (score >= 60) return theme.colors.yellow500;
    return theme.colors.orange500;
  };

  const renderRecipeCard = ({ item }: { item: RecipeWithScore }) => (
    <TouchableOpacity
      style={styles.recipeCard}
      onPress={() => navigation.navigate('RecipeDetail', { recipeId: item.idMeal })}
    >
      <Image source={{ uri: item.strMealThumb }} style={styles.recipeImage} />
      <View style={[styles.scoreBadge, { backgroundColor: getScoreColor(item.similarityScore) }]}>
        <Text style={styles.scoreBadgeText}>{Math.round(item.similarityScore)}%</Text>
      </View>
      <View style={styles.recipeInfo}>
        <Text style={styles.recipeTitle}>{item.strMeal}</Text>
        <View style={styles.recipeMeta}>
          <View style={[globalStyles.badge, globalStyles.badgeOutline]}>
            <Text style={globalStyles.badgeText}>{item.strCategory}</Text>
          </View>
          <View style={[globalStyles.badge, globalStyles.badgeOutline]}>
            <Text style={globalStyles.badgeText}>{item.strArea}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <LinearGradient
      colors={[theme.colors.orange50, theme.colors.background, theme.colors.amber50]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={globalStyles.container}
    >
      <ScrollView contentContainerStyle={globalStyles.contentContainer}>
        <Text style={globalStyles.headingLarge}>Cari Resep</Text>
        <Text style={globalStyles.mutedText}>
          Pilih bahan yang Anda miliki untuk menemukan resep
        </Text>

        {/* Selected Ingredients */}
        {selectedIngredients.length > 0 && (
          <View style={styles.selectedContainer}>
            <Text style={styles.selectedLabel}>
              Dipilih: {selectedIngredients.length} bahan
            </Text>
            <View style={styles.selectedIngredients}>
              {selectedIngredients.map((ing) => (
                <TouchableOpacity
                  key={ing}
                  style={globalStyles.ingredientPill}
                  onPress={() => toggleIngredient(ing)}
                >
                  <Text style={globalStyles.ingredientPillText}>{ing}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Ingredient Categories */}
        {CATEGORIES.map((category) => (
          <View key={category} style={styles.categorySection}>
            <Text style={styles.categoryTitle}>{category}</Text>
            <View style={styles.ingredientGrid}>
              {INGREDIENTS.filter((i) => i.category === category).map((ingredient) => (
                <TouchableOpacity
                  key={ingredient.name}
                  style={[
                    styles.ingredientItem,
                    selectedIngredients.includes(ingredient.name) && styles.ingredientItemSelected,
                  ]}
                  onPress={() => toggleIngredient(ingredient.name)}
                >
                  <View style={styles.checkbox}>
                    {selectedIngredients.includes(ingredient.name) && (
                      <View style={styles.checkboxChecked} />
                    )}
                  </View>
                  <Text style={styles.ingredientLabel}>{ingredient.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Search Button */}
        {selectedIngredients.length > 0 && (
          <TouchableOpacity
            style={[globalStyles.buttonPrimary, styles.searchButton]}
            onPress={searchRecipes}
            disabled={isSearching}
          >
            {isSearching ? (
              <ActivityIndicator color={theme.colors.background} />
            ) : (
              <>
                <Search size={16} color={theme.colors.background} />
                <Text style={globalStyles.buttonText}>Cari Resep ({selectedIngredients.length} bahan)</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {/* Recipe Results */}
        {recipes.length > 0 && (
          <View style={styles.resultsSection}>
            <Text style={globalStyles.headingMedium}>
              {recipes.length} Resep Ditemukan
            </Text>
            <FlatList
              data={recipes}
              renderItem={renderRecipeCard}
              keyExtractor={(item) => item.idMeal}
              scrollEnabled={false}
              contentContainerStyle={styles.recipeList}
            />
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  selectedContainer: {
    marginTop: theme.spacing[6],
    gap: theme.spacing[3],
  },
  selectedLabel: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.foreground,
  },
  selectedIngredients: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing[2],
  },
  categorySection: {
    marginTop: theme.spacing[6],
    gap: theme.spacing[3],
  },
  categoryTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.orange900,
  },
  ingredientGrid: {
    gap: theme.spacing[2],
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
    paddingVertical: theme.spacing[2],
  },
  ingredientItemSelected: {
    opacity: 0.7,
  },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.inputBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    width: 10,
    height: 10,
    borderRadius: 2,
    backgroundColor: theme.colors.orange500,
  },
  ingredientLabel: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.foreground,
    textTransform: 'capitalize',
  },
  searchButton: {
    marginTop: theme.spacing[6],
    marginBottom: theme.spacing[6],
  },
  resultsSection: {
    marginTop: theme.spacing[6],
    gap: theme.spacing[4],
  },
  recipeList: {
    gap: theme.spacing[4],
  },
  recipeCard: {
    ...globalStyles.card,
  },
  recipeImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
  },
  scoreBadge: {
    position: 'absolute',
    top: theme.spacing[4],
    right: theme.spacing[4],
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[2],
    borderRadius: theme.borderRadius.full,
    ...theme.shadows.lg,
  },
  scoreBadgeText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.background,
  },
  recipeInfo: {
    padding: theme.spacing[4],
    gap: theme.spacing[2],
  },
  recipeTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.orange900,
  },
  recipeMeta: {
    flexDirection: 'row',
    gap: theme.spacing[2],
    flexWrap: 'wrap',
  },
});
