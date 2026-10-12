const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const AddressSchema = new mongoose.Schema({
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipCode: { type: String, required: true },
  country: { type: String, default: 'India' },
  isDefault: { type: Boolean, default: false }
});

const UserSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Please add a name'], trim: true },
  email: { 
    type: String, 
    required: [true, 'Please add an email'], 
    unique: true, 
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please add a valid email']
  },
  password: { type: String, required: [true, 'Please add a password'], minlength: 6, select: false },
  role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
  avatar: { type: String, default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' },
  addresses: [AddressSchema],
  isVerified: { type: Boolean, default: true },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: { type: Date, default: Date.now }
});

// Encrypt password using bcrypt
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { id: this._id, role: this.role }, 
    process.env.JWT_SECRET || 'super_secret_jwt_key_enterprise_2026', 
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};

// Generate and hash password reset token
UserSchema.methods.getResetPasswordToken = function() {
  const crypto = require('crypto');
  const resetToken = crypto.randomBytes(20).toString('hex');
  this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
  return resetToken;
};

module.exports = mongoose.model('User', UserSchema);
