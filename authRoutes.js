const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');
const {
  registerUser,
  loginUser,
  updateProfile
} = require('../controllers/authController');

// POST /api/auth/register
router.post('/register', registerUser);

// POST /api/auth/login
router.post('/login', loginUser);

// PATCH /api/auth/profile — update user profile + upload files
router.patch('/profile', protect, upload.fields([
  { name: 'profilePicture', maxCount: 1 },
  { name: 'resume', maxCount: 1 },
  { name: 'coverLetter', maxCount: 1 }
]), updateProfile);

module.exports = router;
