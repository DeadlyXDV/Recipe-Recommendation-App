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

module.exports = router;
