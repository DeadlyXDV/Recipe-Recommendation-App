const SavedRecipe = require('../models/SavedRecipe');

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
