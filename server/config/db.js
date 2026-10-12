const mongoose = require('mongoose');

const connectDB = async () => {
  const connUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ai_ecommerce';
  
  // Enforce IPv4 127.0.0.1 over localhost to prevent ECONNREFUSED resolution mismatches
  const cleanUri = connUri.replace('localhost', '127.0.0.1');

  try {
    const conn = await mongoose.connect(cleanUri, {
      serverSelectionTimeoutMS: 5000
    });

    console.log('✅ MongoDB Connected Successfully');
    console.log(`Host: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error('❌ MongoDB Connection Failed:', error.message);
    process.exit(1);
  }
};

module.exports = { connectDB };
