const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Register a new user
// @route   POST /api/auth/register
const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email and password' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const user = await User.create({
      name,
      email,
      password,
      phone: phone || '',
      role: role || 'candidate'
    });

    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        profilePicture: user.profilePicture,
        resumeUrl: user.resumeUrl,
        coverLetterUrl: user.coverLetterUrl
      }
    });
  } catch (error) {
    console.error('Register error:', error.message);
    res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        profilePicture: user.profilePicture,
        resumeUrl: user.resumeUrl,
        coverLetterUrl: user.coverLetterUrl
      }
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
};

// @desc    Update user profile + upload files
// @route   PATCH /api/auth/profile
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update text fields
    if (req.body.name) user.name = req.body.name;
    if (req.body.phone) user.phone = req.body.phone;

    // Update file fields from cloudinary uploads
    if (req.files) {
      if (req.files.profilePicture && req.files.profilePicture[0]) {
        user.profilePicture = req.files.profilePicture[0].path;
      }
      if (req.files.resume && req.files.resume[0]) {
        user.resumeUrl = req.files.resume[0].path;
      }
      if (req.files.coverLetter && req.files.coverLetter[0]) {
        user.coverLetterUrl = req.files.coverLetter[0].path;
      }
    }

    await user.save();

    res.status(200).json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        profilePicture: user.profilePicture,
        resumeUrl: user.resumeUrl,
        coverLetterUrl: user.coverLetterUrl
      }
    });
  } catch (error) {
    console.error('Profile update error:', error.message);
    res.status(500).json({ message: 'Server error updating profile', error: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  updateProfile
};
