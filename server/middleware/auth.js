const jwt = require('jsonwebtoken');

// Middleware untuk verifikasi token JWT
const authMiddleware = (req, res, next) => {
  try {
    // Ambil token dari header Authorization
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token tidak ditemukan' 
      });
    }

    // Verifikasi token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'recipe_app_secret_key_2024');
    
    // Simpan data user di request
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ 
      success: false, 
      message: 'Token tidak valid atau sudah expired' 
    });
  }
};

module.exports = authMiddleware;
