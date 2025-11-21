const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

// Route untuk pendaftaran
router.post('/signup', authController.signup);

// Route untuk login
router.post('/login', authController.login);

// Route untuk mendapatkan profil user (perlu autentikasi)
router.get('/profile', authMiddleware, authController.getProfile);

module.exports = router;
