const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipeController');
const authMiddleware = require('../middleware/auth');

// Semua route memerlukan autentikasi
router.use(authMiddleware);

// Route untuk menyimpan resep
router.post('/save', recipeController.saveRecipe);

// Route untuk menghapus resep yang disimpan
router.delete('/unsave/:recipeId', recipeController.unsaveRecipe);

// Route untuk mendapatkan semua resep yang disimpan
router.get('/saved', recipeController.getSavedRecipes);

// Route untuk mengecek apakah resep sudah disimpan
router.get('/check/:recipeId', recipeController.checkRecipeSaved);

// Like routes
router.post('/:recipeId/like', recipeController.toggleLike);
router.get('/:recipeId/likes/count', recipeController.getLikeCount);
router.get('/:recipeId/likes/status', recipeController.getLikeStatus);
router.get('/liked', recipeController.getLikedRecipes);

// Comment routes
router.post('/:recipeId/comments', recipeController.addComment);
router.get('/:recipeId/comments', recipeController.getComments);
router.delete('/:recipeId/comments/:commentId', recipeController.deleteComment);

// Recommendation route
router.get('/recommendations', recipeController.getRecommendations);

module.exports = router;
