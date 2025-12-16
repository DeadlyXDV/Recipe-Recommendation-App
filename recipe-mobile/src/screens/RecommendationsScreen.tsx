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
import { Sparkles } from 'lucide-react-native';
import { useAuth } from '../contexts/AuthContext';
import { recipeAPI } from '../services/api';
import { mealDBApi } from '../services/mealDBApi';
import { Recipe } from '../types/recipe';
import { theme } from '../theme';
import { globalStyles } from '../styles/globalStyles';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface Recommendation {
  recipeId: string;
  score: number;
  matchType: string;
}

export default function RecommendationsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      if (user) {
        loadRecommendations();
      }
    }, [user])
  );

  const loadRecommendations = async () => {
    setIsLoading(true);
    try {
      const response = await recipeAPI.getRecommendations();
      if (response.success && response.data.length > 0) {
        setRecommendations(response.data);
        // Load recipe details
        const recipePromises = response.data.map((rec: Recommendation) =>
          mealDBApi.getRecipeById(rec.recipeId)
        );
        const loadedRecipes = await Promise.all(recipePromises);
        setRecipes(loadedRecipes.filter((r): r is Recipe => r !== null));
      } else {
        setRecommendations([]);
        setRecipes([]);
      }
    } catch (error) {
      console.error('Error loading recommendations:', error);
      setRecommendations([]);
      setRecipes([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getMatchBadgeStyle = (matchType: string) => {
    if (matchType === 'both') {
      return { backgroundColor: theme.colors.green100 };
    } else if (matchType === 'category') {
      return { backgroundColor: theme.colors.orange100 };
    } else {
      return { backgroundColor: theme.colors.yellow100 };
    }
  };

  const getMatchBadgeTextStyle = (matchType: string) => {
    if (matchType === 'both') {
      return { color: theme.colors.green700 };
    } else if (matchType === 'category') {
      return { color: theme.colors.orange700 };
    } else {
      return { color: theme.colors.yellow700 };
    }
  };

  const getMatchLabel = (matchType: string) => {
    if (matchType === 'both') return 'Cocok Sempurna';
    if (matchType === 'category') return 'Kategori Cocok';
    return 'Area Cocok';
  };

  const renderRecipeCard = ({ item, index }: { item: Recipe; index: number }) => {
    const recommendation = recommendations[index];
    return (
      <TouchableOpacity
        style={styles.recipeCard}
        onPress={() => navigation.navigate('RecipeDetail', { recipeId: item.idMeal })}
      >
        <Image source={{ uri: item.strMealThumb }} style={styles.recipeImage} />
        <View style={[styles.matchBadge, getMatchBadgeStyle(recommendation.matchType)]}>
          <Text style={[styles.matchBadgeText, getMatchBadgeTextStyle(recommendation.matchType)]}>
            {getMatchLabel(recommendation.matchType)}
          </Text>
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
  };

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <Sparkles size={64} color={theme.colors.mutedForeground} />
      <Text style={globalStyles.headingMedium}>Belum Ada Rekomendasi</Text>
      <Text style={[globalStyles.mutedText, { textAlign: 'center' }]}>
        Simpan atau like beberapa resep untuk mendapatkan rekomendasi yang dipersonalisasi
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
        <Text style={globalStyles.headingLarge}>Rekomendasi</Text>
        <Text style={globalStyles.mutedText}>
          Resep yang cocok dengan preferensi Anda
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
    paddingHorizontal: theme.spacing[6],
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
  matchBadge: {
    position: 'absolute',
    top: theme.spacing[4],
    right: theme.spacing[4],
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[2],
    borderRadius: theme.borderRadius.full,
    ...theme.shadows.lg,
  },
  matchBadgeText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.medium,
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
