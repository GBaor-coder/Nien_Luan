const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { sendSuccess, sendError } = require('../utils/apiResponse');

const UPLOADS_DIR = path.join(__dirname, '..', '..', 'uploads');

fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'upload-' + uniqueSuffix + ext);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (jpg, png, webp, gif) are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

const uploadImage = (req, res) => {
  if (!req.file) {
    return sendError(res, 'No file uploaded', 400);
  }
  const imageUrl = `/uploads/${req.file.filename}`;
  return sendSuccess(res, { url: imageUrl }, 'Image uploaded successfully');
};

module.exports = { upload, uploadImage };
