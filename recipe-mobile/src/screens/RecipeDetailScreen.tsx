import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  Alert,
  Share,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Bookmark, Heart, MessageCircle, ShareIcon, Trash2 } from 'lucide-react-native';
import { useAuth } from '../contexts/AuthContext';
import { mealDBApi } from '../services/mealDBApi';
import { recipeAPI } from '../services/api';
import { Recipe, getRecipeIngredients } from '../types/recipe';
import { theme } from '../theme';
import { globalStyles } from '../styles/globalStyles';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

type RecipeDetailScreenProps = NativeStackScreenProps<RootStackParamList, 'RecipeDetail'>;

interface Comment {
  id: number;
  user_id: number;
  user_name: string;
  comment_text: string;
  created_at: string;
}

export default function RecipeDetailScreen({ route, navigation }: RecipeDetailScreenProps) {
  const { recipeId } = route.params;
  const { user, isRecipeSaved, saveRecipe, unsaveRecipe, isRecipeLiked, toggleLike } = useAuth();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  useEffect(() => {
    loadRecipe();
    if (user) {
      loadLikeData();
      loadComments();
    }
  }, [recipeId, user]);

  useEffect(() => {
    if (recipe) {
      setIsSaved(isRecipeSaved(recipeId));
      setIsLiked(isRecipeLiked(recipeId));
    }
  }, [recipe, isRecipeSaved, isRecipeLiked]);

  const loadRecipe = async () => {
    try {
      const data = await mealDBApi.getRecipeById(recipeId);
      setRecipe(data);
    } catch (error) {
      console.error('Error loading recipe:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadLikeData = async () => {
    if (!user) {
      setLikeCount(0);
      return;
    }
    try {
      const countResponse = await recipeAPI.getLikeCount(recipeId);
      if (countResponse.success) {
        setLikeCount(countResponse.data.count);
      }
    } catch (error) {
      // Ignore 401 errors for guest users
      if (error.response?.status !== 401) {
        console.error('Error loading like data:', error);
      }
    }
  };

  const loadComments = async () => {
    if (!user) {
      setComments([]);
      return;
    }
    try {
      const response = await recipeAPI.getComments(recipeId);
      if (response.success) {
        setComments(response.data);
      }
    } catch (error) {
      // Ignore 401 errors for guest users
      if (error.response?.status !== 401) {
        console.error('Error loading comments:', error);
      }
    }
  };

  const handleSaveToggle = async () => {
    if (!user) {
      Alert.alert(
        'Login Diperlukan',
        'Silakan login untuk menyimpan resep',
        [
          { text: 'Batal', style: 'cancel' },
          { text: 'Login', onPress: () => navigation.navigate('Login') }
        ]
      );
      return;
    }
    if (!recipe) return;
    try {
      if (isSaved) {
        await unsaveRecipe(recipeId);
      } else {
        await saveRecipe(recipeId, recipe.strMeal, recipe.strMealThumb);
      }
      setIsSaved(!isSaved);
    } catch (error) {
      Alert.alert('Error', 'Gagal menyimpan resep');
    }
  };

  const handleLikeToggle = async () => {
    if (!user) {
      Alert.alert(
        'Login Diperlukan',
        'Silakan login untuk memberikan like',
        [
          { text: 'Batal', style: 'cancel' },
          { text: 'Login', onPress: () => navigation.navigate('Login') }
        ]
      );
      return;
    }
    try {
      const result = await toggleLike(recipeId);
      setIsLiked(result.isLiked);
      setLikeCount(result.count);
    } catch (error) {
      Alert.alert('Error', 'Gagal memberikan like');
    }
  };

  const handleAddComment = async () => {
    if (!user) {
      Alert.alert(
        'Login Diperlukan',
        'Silakan login untuk menambahkan komentar',
        [
          { text: 'Batal', style: 'cancel' },
          { text: 'Login', onPress: () => navigation.navigate('Login') }
        ]
      );
      return;
    }
    if (!newComment.trim()) return;
    if (newComment.length > 500) {
      Alert.alert('Error', 'Komentar maksimal 500 karakter');
      return;
    }

    setIsSubmittingComment(true);
    try {
      await recipeAPI.addComment(recipeId, newComment);
      setNewComment('');
      await loadComments();
    } catch (error) {
      Alert.alert('Error', 'Gagal menambahkan komentar');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    Alert.alert('Hapus Komentar', 'Apakah Anda yakin ingin menghapus komentar ini?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: async () => {
          try {
            await recipeAPI.deleteComment(recipeId, commentId);
            await loadComments();
          } catch (error) {
            Alert.alert('Error', 'Gagal menghapus komentar');
          }
        },
      },
    ]);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this recipe: ${recipe?.strMeal}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.orange500} />
      </View>
    );
  }

  if (!recipe) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={globalStyles.mutedText}>Resep tidak ditemukan</Text>
      </View>
    );
  }

  const ingredients = getRecipeIngredients(recipe);

  return (
    <LinearGradient
      colors={[theme.colors.orange50, theme.colors.background, theme.colors.amber50]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={globalStyles.container}
    >
      <ScrollView>
        <Image source={{ uri: recipe.strMealThumb }} style={styles.headerImage} />

        <View style={styles.content}>
          {/* Title and Actions */}
          <View style={styles.header}>
            <Text style={styles.title}>{recipe.strMeal}</Text>
            <View style={styles.actions}>
              <TouchableOpacity onPress={handleSaveToggle} style={styles.actionButton}>
                <Bookmark
                  size={24}
                  color={isSaved ? theme.colors.orange500 : theme.colors.mutedForeground}
                  fill={isSaved ? theme.colors.orange500 : 'none'}
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleLikeToggle} style={styles.actionButton}>
                <Heart
                  size={24}
                  color={isLiked ? theme.colors.red600 : theme.colors.mutedForeground}
                  fill={isLiked ? theme.colors.red600 : 'none'}
                />
                <Text style={styles.likeCount}>{likeCount}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleShare} style={styles.actionButton}>
                <ShareIcon size={24} color={theme.colors.mutedForeground} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Meta Info */}
          <View style={styles.metaContainer}>
            <View style={[globalStyles.badge, globalStyles.badgeOutline]}>
              <Text style={globalStyles.badgeText}>{recipe.strCategory}</Text>
            </View>
            <View style={[globalStyles.badge, globalStyles.badgeOutline]}>
              <Text style={globalStyles.badgeText}>{recipe.strArea}</Text>
            </View>
          </View>

          {/* Ingredients */}
          <View style={styles.section}>
            <Text style={globalStyles.headingMedium}>Bahan-bahan</Text>
            <View style={styles.ingredientsCard}>
              {ingredients.map((ing, index) => (
                <View key={`ingredient-${index}-${ing.ingredient}`} style={styles.ingredientItem}>
                  <View style={styles.bulletPoint} />
                  <View style={styles.ingredientContent}>
                    <Text style={styles.ingredientName}>{ing.ingredient}</Text>
                    <Text style={styles.ingredientMeasure}>{ing.measure}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Instructions */}
          <View style={styles.section}>
            <Text style={globalStyles.headingMedium}>Cara Membuat</Text>
            <View style={styles.instructionsCard}>
              {recipe.strInstructions ? (
                recipe.strInstructions.split(/\r?\n/).filter(step => step.trim()).map((step, index) => (
                  <View key={`step-${index}`} style={styles.stepItem}>
                    <View style={styles.stepNumber}>
                      <Text style={styles.stepNumberText}>{index + 1}</Text>
                    </View>
                    <Text style={styles.stepText}>{step.trim()}</Text>
                  </View>
                ))
              ) : (
                <Text style={globalStyles.bodyText}>Instruksi tidak tersedia</Text>
              )}
            </View>
          </View>

          {/* Comments */}
          <View style={styles.section}>
            <Text style={globalStyles.headingMedium}>
              Komentar ({comments.length})
            </Text>

            {/* Add Comment */}
            <View style={styles.addCommentContainer}>
              <TextInput
                style={styles.commentInput}
                placeholder="Tulis komentar... (maks 500 karakter)"
                value={newComment}
                onChangeText={setNewComment}
                multiline
                maxLength={500}
              />
              <TouchableOpacity
                style={[globalStyles.buttonPrimary, styles.submitCommentButton]}
                onPress={handleAddComment}
                disabled={isSubmittingComment || !newComment.trim()}
              >
                {isSubmittingComment ? (
                  <ActivityIndicator size="small" color={theme.colors.background} />
                ) : (
                  <MessageCircle size={16} color={theme.colors.background} />
                )}
              </TouchableOpacity>
            </View>

            {/* Comments List */}
            <View style={styles.commentsList}>
              {comments.map((comment) => (
                <View key={comment.id} style={styles.commentItem}>
                  <View style={styles.commentHeader}>
                    <Text style={styles.commentAuthor}>{comment.user_name}</Text>
                    {user && user.id === comment.user_id.toString() && (
                      <TouchableOpacity onPress={() => handleDeleteComment(comment.id)}>
                        <Trash2 size={16} color={theme.colors.red600} />
                      </TouchableOpacity>
                    )}
                  </View>
                  <Text style={styles.commentText}>{comment.comment_text}</Text>
                  <Text style={styles.commentDate}>
                    {new Date(comment.created_at).toLocaleDateString('id-ID')}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerImage: {
    width: '100%',
    height: 300,
  },
  content: {
    padding: theme.spacing[4],
    gap: theme.spacing[6],
  },
  header: {
    gap: theme.spacing[3],
  },
  title: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.orange900,
  },
  actions: {
    flexDirection: 'row',
    gap: theme.spacing[4],
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[1],
  },
  likeCount: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.foreground,
  },
  metaContainer: {
    flexDirection: 'row',
    gap: theme.spacing[2],
    flexWrap: 'wrap',
  },
  section: {
    gap: theme.spacing[4],
  },
  ingredientsCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing[4],
    gap: theme.spacing[3],
  },
  ingredientItem: {
    flexDirection: 'row',
    gap: theme.spacing[3],
    alignItems: 'flex-start',
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.orange500,
    marginTop: 8,
  },
  ingredientContent: {
    flex: 1,
    gap: theme.spacing[1],
  },
  ingredientName: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.foreground,
    textTransform: 'capitalize',
  },
  ingredientMeasure: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.orange700,
  },
  instructionsCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing[4],
    gap: theme.spacing[5],
  },
  stepItem: {
    flexDirection: 'row',
    gap: theme.spacing[3],
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.orange500,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.background,
  },
  stepText: {
    flex: 1,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.foreground,
    lineHeight: 24,
  },
  addCommentContainer: {
    flexDirection: 'row',
    gap: theme.spacing[2],
    alignItems: 'flex-start',
  },
  commentInput: {
    flex: 1,
    ...globalStyles.input,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  submitCommentButton: {
    width: 40,
    height: 40,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  commentsList: {
    gap: theme.spacing[3],
  },
  commentItem: {
    backgroundColor: theme.colors.card,
    padding: theme.spacing[4],
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: theme.spacing[2],
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  commentAuthor: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.orange700,
  },
  commentText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.foreground,
  },
  commentDate: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.mutedForeground,
  },
});
