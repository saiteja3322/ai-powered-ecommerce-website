const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const path = require('path');

// 1. Ensure dotenv is loaded before initializing any database connection
dotenv.config();

const { connectDB } = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Route Imports
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const couponRoutes = require('./routes/couponRoutes');
const aiRoutes = require('./routes/aiRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

const app = express();

// Security & Middleware
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({
  origin: process.env.FRONTEND_URL || true,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(compression());

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate Limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 300,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api', limiter);

// Mount API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/coupons', couponRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/upload', uploadRoutes);

// Health Check
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    timestamp: new Date(),
    service: 'Enterprise AI-Powered E-Commerce Server'
  });
});

// Serve frontend in production build if built
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client', 'dist', 'index.html'));
  });
}

// Global Error Handler Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Start Server: Await DB connection first before starting Express server
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
};

startServer();
