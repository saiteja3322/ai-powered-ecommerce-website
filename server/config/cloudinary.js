const cloudinary = require('cloudinary').v2;
const fs = require('fs');

// Configure Cloudinary from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || ''
});

// Check if Cloudinary environment variables are set and valid
const isCloudinaryConfigured = () => {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name' &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
};

// Upload local file to Cloudinary
const uploadToCloudinary = async (filePath, folder = 'ai_ecommerce_products') => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: folder,
      use_filename: true,
      unique_filename: true,
      resource_type: 'auto'
    });

    // Remove local temp file after successful upload
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return {
      success: true,
      url: result.secure_url,
      public_id: result.public_id
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
};

// Delete image from Cloudinary by public_id
const deleteFromCloudinary = async (publicId) => {
  try {
    if (!publicId) return;
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Cloudinary delete error:', error.message);
  }
};

module.exports = {
  cloudinary,
  isCloudinaryConfigured,
  uploadToCloudinary,
  deleteFromCloudinary
};
