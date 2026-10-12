const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Coupon = require('../models/Coupon');
const Review = require('../models/Review');
const { sampleCategories, sampleCoupons, sampleProducts } = require('./seedData');

dotenv.config({ path: __dirname + '/../.env' });

const seedDB = async () => {
  try {
    const connStr = (process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ai_ecommerce').replace('localhost', '127.0.0.1');
    await mongoose.connect(connStr);
    console.log('[Seed] Connected to MongoDB for seeding...');

    await User.deleteMany();
    await Product.deleteMany();
    await Category.deleteMany();
    await Coupon.deleteMany();
    await Review.deleteMany();

    // Create Admin & Customer Users
    const adminUser = await User.create({
      name: 'Senior Admin',
      email: 'admin@ecommerce.com',
      password: 'adminpassword123',
      role: 'admin',
      isVerified: true
    });

    const customerUser = await User.create({
      name: 'Rahul Sharma',
      email: 'customer@ecommerce.com',
      password: 'customerpassword123',
      role: 'customer',
      isVerified: true,
      addresses: [
        {
          street: 'Plot No. 42, Jubilee Hills',
          city: 'Hyderabad',
          state: 'Telangana',
          zipCode: '500033',
          country: 'India',
          isDefault: true
        }
      ]
    });

    console.log('[Seed] Users Created: Admin (admin@ecommerce.com / adminpassword123), Customer (customer@ecommerce.com / customerpassword123)');

    await Category.insertMany(sampleCategories);
    console.log(`[Seed] ${sampleCategories.length} Categories seeded.`);

    await Coupon.insertMany(sampleCoupons);
    console.log(`[Seed] ${sampleCoupons.length} Coupons seeded.`);

    const createdProducts = await Product.insertMany(sampleProducts);
    console.log(`[Seed] ${createdProducts.length} Products seeded across 13 Indian categories.`);

    // Add initial reviews
    await Review.create({
      product: createdProducts[0]._id,
      user: customerUser._id,
      name: customerUser.name,
      rating: 5,
      title: 'Blown away by iPhone 15 Pro Titanium & Camera!',
      comment: 'Delivered in 24 hours to Hyderabad! The A17 Pro gaming graphics and spatial video features are unmatched.',
      isApproved: true
    });

    console.log('[Seed] Indian E-Commerce Seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('[Seed Error]:', err.message);
    process.exit(1);
  }
};

if (require.main === module) {
  seedDB();
}

module.exports = seedDB;
