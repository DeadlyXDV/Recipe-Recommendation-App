import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Bookmark } from 'lucide-react-native';
import { useAuth } from '../contexts/AuthContext';
import { mealDBApi } from '../services/mealDBApi';
import { Recipe } from '../types/recipe';
import { theme } from '../theme';
import { globalStyles } from '../styles/globalStyles';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function SavedScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { savedRecipes, loadSavedRecipes } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      loadRecipeDetails();
    }, [savedRecipes])
  );

  const loadRecipeDetails = async () => {
    if (savedRecipes.length === 0) {
      setRecipes([]);
      return;
    }

    setIsLoading(true);
    try {
      const recipePromises = savedRecipes.map((saved) =>
        mealDBApi.getRecipeById(saved.recipe_id)
      );
      const loadedRecipes = await Promise.all(recipePromises);
      setRecipes(loadedRecipes.filter((r): r is Recipe => r !== null));
    } catch (error) {
      console.error('Error loading saved recipes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderRecipeCard = ({ item }: { item: Recipe }) => (
    <TouchableOpacity
      style={styles.recipeCard}
      onPress={() => navigation.navigate('RecipeDetail', { recipeId: item.idMeal })}
    >
      <Image source={{ uri: item.strMealThumb }} style={styles.recipeImage} />
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

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <Bookmark size={64} color={theme.colors.mutedForeground} />
      <Text style={globalStyles.headingMedium}>Belum Ada Resep Tersimpan</Text>
      <Text style={globalStyles.mutedText}>
        Simpan resep favorit Anda untuk akses mudah
      </Text>
    </View>
  );

  return (
    <LinearGradient
      colors={[theme.colors.orange50, theme.colors.background, theme.colors.amber50]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={globalStyles.container}
    >
      <View style={globalStyles.contentContainer}>
        <Text style={globalStyles.headingLarge}>Resep Tersimpan</Text>
        <Text style={globalStyles.mutedText}>
          {savedRecipes.length} resep dalam koleksi Anda
        </Text>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.orange500} />
          </View>
        ) : recipes.length === 0 ? (
          <EmptyState />
        ) : (
          <FlatList
            data={recipes}
            renderItem={renderRecipeCard}
            keyExtractor={(item) => item.idMeal}
            contentContainerStyle={styles.recipeList}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: theme.spacing[16],
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: theme.spacing[16],
    gap: theme.spacing[4],
  },
  recipeList: {
    marginTop: theme.spacing[6],
    gap: theme.spacing[4],
    paddingBottom: theme.spacing[6],
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
