const SavedRecipe = require('../models/SavedRecipe');
const RecipeLike = require('../models/RecipeLike');
const RecipeComment = require('../models/RecipeComment');
const UserRecipeInteraction = require('../models/UserRecipeInteraction');
const fetch = require('node-fetch');

// Helper function to fetch recipe details from TheMealDB
const fetchRecipeDetails = async (recipeId) => {
  try {
    const response = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${recipeId}`);
    const data = await response.json();
    if (data.meals && data.meals[0]) {
      return {
        category: data.meals[0].strCategory,
        area: data.meals[0].strArea
      };
    }
    return { category: null, area: null };
  } catch (error) {
    console.error('Error fetching recipe details:', error);
    return { category: null, area: null };
  }
};

// Simpan resep
exports.saveRecipe = async (req, res) => {
  try {
    const { recipeId, recipeName, recipeImage } = req.body;
    const userId = req.user.userId;

    // Validasi input
    if (!recipeId || !recipeName) {
      return res.status(400).json({
        success: false,
        message: 'Recipe ID dan nama resep harus diisi'
      });
    }

    // Cek apakah sudah disimpan
    const alreadySaved = await SavedRecipe.isRecipeSaved(userId, recipeId);
    if (alreadySaved) {
      return res.status(400).json({
        success: false,
        message: 'Resep sudah disimpan sebelumnya'
      });
    }

    // Simpan resep
    const savedId = await SavedRecipe.save(userId, recipeId, recipeName, recipeImage);
    
    if (!savedId) {
      return res.status(400).json({
        success: false,
        message: 'Resep sudah disimpan'
      });
    }

    // Track interaction for recommendation
    const recipeDetails = await fetchRecipeDetails(recipeId);
    await UserRecipeInteraction.create(
      userId, 
      recipeId, 
      recipeDetails.category, 
      recipeDetails.area, 
      'save'
    );

    res.status(201).json({
      success: true,
      message: 'Resep berhasil disimpan',
      data: { id: savedId }
    });
  } catch (error) {
    console.error('Error save recipe:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat menyimpan resep'
    });
  }
};

// Hapus resep yang disimpan
exports.unsaveRecipe = async (req, res) => {
  try {
    const { recipeId } = req.params;
    const userId = req.user.userId;

    if (!recipeId) {
      return res.status(400).json({
        success: false,
        message: 'Recipe ID harus diisi'
      });
    }

    const removed = await SavedRecipe.remove(userId, recipeId);
    
    if (!removed) {
      return res.status(404).json({
        success: false,
        message: 'Resep tidak ditemukan'
      });
    }

    // Remove interaction tracking
    await UserRecipeInteraction.deleteByRecipeAndType(userId, recipeId, 'save');

    res.status(200).json({
      success: true,
      message: 'Resep berhasil dihapus dari daftar simpanan'
    });
  } catch (error) {
    console.error('Error unsave recipe:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat menghapus resep'
    });
  }
};

// Ambil semua resep yang disimpan
exports.getSavedRecipes = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const savedRecipes = await SavedRecipe.findByUserId(userId);

    res.status(200).json({
      success: true,
      data: savedRecipes
    });
  } catch (error) {
    console.error('Error get saved recipes:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil resep yang disimpan'
    });
  }
};

// Cek apakah resep sudah disimpan
exports.checkRecipeSaved = async (req, res) => {
  try {
    const { recipeId } = req.params;
    const userId = req.user.userId;

    const isSaved = await SavedRecipe.isRecipeSaved(userId, recipeId);

    res.status(200).json({
      success: true,
      data: { isSaved }
    });
  } catch (error) {
    console.error('Error check recipe saved:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengecek status resep'
    });
  }
};

// Toggle like (like/unlike)
exports.toggleLike = async (req, res) => {
  try {
    const { recipeId } = req.params;
    const userId = req.user.userId;

    if (!recipeId) {
      return res.status(400).json({
        success: false,
        message: 'Recipe ID harus diisi'
      });
    }

    // Check if already liked
    const isLiked = await RecipeLike.checkIfUserLiked(userId, recipeId);

    if (isLiked) {
      // Unlike
      await RecipeLike.delete(userId, recipeId);
      await UserRecipeInteraction.deleteByRecipeAndType(userId, recipeId, 'like');
      
      const count = await RecipeLike.getCountByRecipe(recipeId);
      
      return res.status(200).json({
        success: true,
        message: 'Like berhasil dihapus',
        data: { isLiked: false, count }
      });
    } else {
      // Like
      await RecipeLike.create(userId, recipeId);
      
      // Track interaction for recommendation
      const recipeDetails = await fetchRecipeDetails(recipeId);
      await UserRecipeInteraction.create(
        userId, 
        recipeId, 
        recipeDetails.category, 
        recipeDetails.area, 
        'like'
      );
      
      const count = await RecipeLike.getCountByRecipe(recipeId);
      
      return res.status(201).json({
        success: true,
        message: 'Resep berhasil di-like',
        data: { isLiked: true, count }
      });
    }
  } catch (error) {
    console.error('Error toggle like:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat memproses like'
    });
  }
};

// Get like count for a recipe
exports.getLikeCount = async (req, res) => {
  try {
    const { recipeId } = req.params;
    
    const count = await RecipeLike.getCountByRecipe(recipeId);
    
    res.status(200).json({
      success: true,
      data: { count }
    });
  } catch (error) {
    console.error('Error get like count:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil jumlah like'
    });
  }
};

// Get like status for current user
exports.getLikeStatus = async (req, res) => {
  try {
    const { recipeId } = req.params;
    const userId = req.user.userId;
    
    const isLiked = await RecipeLike.checkIfUserLiked(userId, recipeId);
    
    res.status(200).json({
      success: true,
      data: { isLiked }
    });
  } catch (error) {
    console.error('Error get like status:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengecek status like'
    });
  }
};

// Get all liked recipes for current user
exports.getLikedRecipes = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const likedRecipes = await RecipeLike.getAllByUser(userId);
    
    res.status(200).json({
      success: true,
      data: likedRecipes
    });
  } catch (error) {
    console.error('Error get liked recipes:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil resep yang di-like'
    });
  }
};

// Add comment to a recipe
exports.addComment = async (req, res) => {
  try {
    const { recipeId } = req.params;
    const { commentText } = req.body;
    const userId = req.user.userId;

    // Validasi input
    if (!recipeId || !commentText) {
      return res.status(400).json({
        success: false,
        message: 'Recipe ID dan komentar harus diisi'
      });
    }

    // Validasi panjang komentar (max 500 karakter)
    if (commentText.length > 500) {
      return res.status(400).json({
        success: false,
        message: 'Komentar maksimal 500 karakter'
      });
    }

    // Trim whitespace
    const trimmedComment = commentText.trim();
    if (!trimmedComment) {
      return res.status(400).json({
        success: false,
        message: 'Komentar tidak boleh kosong'
      });
    }

    await RecipeComment.create(userId, recipeId, trimmedComment);
    
    res.status(201).json({
      success: true,
      message: 'Komentar berhasil ditambahkan'
    });
  } catch (error) {
    console.error('Error add comment:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat menambahkan komentar'
    });
  }
};

// Get all comments for a recipe
exports.getComments = async (req, res) => {
  try {
    const { recipeId } = req.params;
    
    const comments = await RecipeComment.getByRecipe(recipeId);
    
    res.status(200).json({
      success: true,
      data: comments
    });
  } catch (error) {
    console.error('Error get comments:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil komentar'
    });
  }
};

// Delete a comment
exports.deleteComment = async (req, res) => {
  try {
    const { recipeId, commentId } = req.params;
    const userId = req.user.userId;

    // Get comment to check ownership
    const comment = await RecipeComment.getById(commentId);
    
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Komentar tidak ditemukan'
      });
    }

    // Check if user is the comment owner
    if (comment.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Anda tidak memiliki izin untuk menghapus komentar ini'
      });
    }

    await RecipeComment.delete(commentId);
    
    res.status(200).json({
      success: true,
      message: 'Komentar berhasil dihapus'
    });
  } catch (error) {
    console.error('Error delete comment:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat menghapus komentar'
    });
  }
};

// Get recipe recommendations based on user interactions
exports.getRecommendations = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get user's top categories and areas
    const topCategories = await UserRecipeInteraction.getTopCategories(userId, 3);
    const topAreas = await UserRecipeInteraction.getTopAreas(userId, 3);

    if (topCategories.length === 0 && topAreas.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        message: 'Belum ada data interaksi untuk rekomendasi'
      });
    }

    // Fetch recipes from TheMealDB based on categories and areas
    const recipesMap = new Map();
    
    // Fetch by categories
    for (const category of topCategories) {
      try {
        const response = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`);
        const data = await response.json();
        if (data.meals) {
          data.meals.forEach(meal => {
            const score = recipesMap.get(meal.idMeal)?.score || 0;
            recipesMap.set(meal.idMeal, {
              id: meal.idMeal,
              name: meal.strMeal,
              image: meal.strMealThumb,
              score: score + 3, // Category match = +3 points
              matchType: score > 0 ? 'both' : 'category'
            });
          });
        }
      } catch (error) {
        console.error(`Error fetching recipes for category ${category}:`, error);
      }
    }

    // Fetch by areas
    for (const area of topAreas) {
      try {
        const response = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?a=${area}`);
        const data = await response.json();
        if (data.meals) {
          data.meals.forEach(meal => {
            const existing = recipesMap.get(meal.idMeal);
            if (existing) {
              recipesMap.set(meal.idMeal, {
                ...existing,
                score: existing.score + 2, // Area match = +2 points
                matchType: 'both'
              });
            } else {
              recipesMap.set(meal.idMeal, {
                id: meal.idMeal,
                name: meal.strMeal,
                image: meal.strMealThumb,
                score: 2,
                matchType: 'area'
              });
            }
          });
        }
      } catch (error) {
        console.error(`Error fetching recipes for area ${area}:`, error);
      }
    }

    // Convert to array and sort by score
    const recommendations = Array.from(recipesMap.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, 10); // Top 10 recommendations

    res.status(200).json({
      success: true,
      data: recommendations,
      metadata: {
        topCategories,
        topAreas
      }
    });
  } catch (error) {
    console.error('Error get recommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil rekomendasi'
    });
  }
};
