const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

const authRoutes = require('./auth');
const categoryRoutes = require('./categories');
const productRoutes = require('./products');
const orderRoutes = require('./orders');
const uploadRoutes = require('./upload');
const chatRoutes = require('./chat');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/truckparts';

// 🔓 Разрешаем CORS
app.use(cors());

// 📦 Обработка JSON и form-data
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // 💥 ОБЯЗАТЕЛЬНО для form-data

// 📂 Статические файлы (изображения и загрузки)
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // 💬 Картинки чата

// 📌 API маршруты
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/chat', chatRoutes);

// 🔌 Подключение к MongoDB и запуск сервера
mongoose.connect(MONGO_URL)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => {
      console.log(`🚀 Server started on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ DB connection error:', err);
  });
