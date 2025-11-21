# Recipe Recommendation App

Aplikasi web untuk menemukan resep masakan berdasarkan bahan-bahan yang Anda miliki. Aplikasi ini mengintegrasikan frontend React dengan backend Express.js dan database MySQL.

## 🌟 Fitur Utama

- 🔍 **Pencarian Resep Cerdas** - Cari resep berdasarkan bahan yang tersedia dengan scoring kesesuaian
- 🔐 **Autentikasi User** - Sistem login/signup dengan JWT authentication
- 💾 **Simpan Resep Favorit** - Simpan resep favorit ke database
- 📱 **Responsive Design** - Tampilan optimal di semua perangkat
- 🎨 **Modern UI** - Menggunakan Tailwind CSS dan Radix UI
- 🍳 **TheMealDB API** - Ribuan resep dari berbagai negara

## 🛠️ Teknologi

### Frontend
- React + TypeScript
- Vite
- Tailwind CSS
- Radix UI Components
- TheMealDB API

### Backend
- Express.js (JavaScript)
- MySQL Database
- JWT Authentication
- Bcrypt (Password Hashing)

## 📦 Instalasi Cepat

### 1. Setup Database
```bash
mysql -u root -p < recipe_app.sql
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Jalankan Backend (Terminal 1)
```bash
npm run server
```

### 4. Jalankan Frontend (Terminal 2)
```bash
npm run dev
```

Aplikasi akan berjalan di:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## 📚 Dokumentasi

- `QUICK_START.md` - Panduan cepat memulai
- `INSTALASI.md` - Panduan instalasi lengkap
- `RINGKASAN_BACKEND.md` - Dokumentasi backend
- `API_TESTING.js` - Contoh testing API

## 🗄️ Struktur Database

### Tabel Users
- Menyimpan data pengguna
- Password di-hash dengan bcrypt
- Email unique

### Tabel Saved Recipes
- Relasi dengan tabel users
- Menyimpan recipe_id dari TheMealDB
- Unique constraint per user

## 🔌 API Endpoints

### Auth
- `POST /api/auth/signup` - Daftar user baru
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get profile (auth required)

### Recipes
- `POST /api/recipes/save` - Simpan resep (auth required)
- `DELETE /api/recipes/unsave/:recipeId` - Hapus resep (auth required)
- `GET /api/recipes/saved` - Get resep tersimpan (auth required)
- `GET /api/recipes/check/:recipeId` - Cek status resep (auth required)

## 📝 Cara Menggunakan

1. Buka aplikasi di browser
2. Daftar akun baru atau login
3. Klik "Pilih Bahan" untuk memilih bahan-bahan yang tersedia
4. Klik "Cari Resep" untuk melihat rekomendasi
5. Setiap resep menampilkan skor kesesuaian dengan bahan Anda
6. Klik "Simpan" untuk menyimpan resep favorit
7. Akses resep tersimpan dari menu "Resep Tersimpan"

## 🔒 Keamanan

- Password di-hash dengan bcrypt
- JWT token untuk autentikasi
- Middleware auth untuk protect routes
- CORS configuration
- Environment variables untuk data sensitif

## 🚀 Scripts

```bash
npm run dev      # Jalankan frontend (Vite dev server)
npm run build    # Build frontend untuk production
npm run server   # Jalankan backend (dengan nodemon)
npm start        # Jalankan backend (production)
```

## 📁 Struktur Project

```
Recipe Recommendation App/
├── server/                    # Backend Express.js
│   ├── config/               # Konfigurasi database
│   ├── controllers/          # Business logic
│   ├── middleware/           # Auth middleware
│   ├── models/              # Database models
│   ├── routes/              # API routes
│   ├── .env                 # Environment variables
│   └── index.js             # Entry point
├── src/                      # Frontend React
│   ├── components/          # React components
│   ├── contexts/            # React contexts
│   ├── lib/                 # API helpers
│   └── App.tsx              # Main component
├── recipe_app.sql           # Database schema
└── package.json             # Dependencies
```

## ⚙️ Environment Variables

File `server/.env`:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=recipe_app
JWT_SECRET=recipe_app_secret_key_2024
```

## 🐛 Troubleshooting

### Database Error
- Pastikan MySQL running
- Cek kredensial di `.env`
- Pastikan database `recipe_app` sudah dibuat

### Port Already in Use
- Ubah PORT di `server/.env`
- Ubah port di `vite.config.ts`

## 👨‍💻 Untuk Tugas Kuliah

Aplikasi ini dibuat dengan kode yang sederhana dan mudah dipahami:
- Tidak ada pattern yang kompleks
- Komentar di setiap bagian penting
- Struktur folder yang jelas
- Code yang readable

## 📄 License

This project is for educational purposes.

## 🙏 Credits

- Design: Based on Figma design
- API: TheMealDB API (https://www.themealdb.com/)
- UI Components: Radix UI & shadcn/ui

---

**Catatan**: Aplikasi ini dibuat untuk keperluan pembelajaran dan tugas kuliah.
