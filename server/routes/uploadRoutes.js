const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { isCloudinaryConfigured, uploadToCloudinary } = require('../config/cloudinary');

// Ensure local uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `prod-${uniqueSuffix}${ext}`);
  }
});

// File Filter for Validation (jpg, jpeg, png, webp)
const fileFilter = (req, file, cb) => {
  const allowedExts = /jpeg|jpg|png|webp/;
  const extName = allowedExts.test(path.extname(file.originalname).toLowerCase());
  const mimeType = allowedExts.test(file.mimetype);

  if (extName && mimeType) {
    return cb(null, true);
  } else {
    cb(new Error('Invalid file format. Only JPG, JPEG, PNG, and WEBP image formats are supported.'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max per image
  fileFilter: fileFilter
});

// @route POST /api/v1/upload
// @desc Upload product images (Cloudinary with local disk storage fallback)
router.post('/', (req, res) => {
  const uploadArray = upload.array('images', 10); // max 10 images at once

  uploadArray(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ success: false, message: 'Image size exceeds maximum limit of 5MB per file.' });
      }
      return res.status(400).json({ success: false, message: `Upload error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'Please select at least one image file to upload.' });
    }

    try {
      const urls = [];
      const useCloudinary = isCloudinaryConfigured();

      for (const file of req.files) {
        if (useCloudinary) {
          const cloudResult = await uploadToCloudinary(file.path);
          if (cloudResult.success && cloudResult.url) {
            urls.push(cloudResult.url);
          } else {
            // Fallback to local URL if Cloudinary upload failed
            const host = req.get('host');
            const protocol = req.protocol;
            urls.push(`${protocol}://${host}/uploads/${file.filename}`);
          }
        } else {
          // Cloudinary not configured: use local disk URL
          const host = req.get('host');
          const protocol = req.protocol;
          urls.push(`${protocol}://${host}/uploads/${file.filename}`);
        }
      }

      return res.status(200).json({
        success: true,
        message: `${urls.length} image(s) uploaded successfully!`,
        urls: urls
      });
    } catch (uploadErr) {
      console.error('Upload processing error:', uploadErr);
      return res.status(500).json({ success: false, message: 'Server error while processing uploaded images.' });
    }
  });
});

module.exports = router;
