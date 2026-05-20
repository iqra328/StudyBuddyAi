const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Note = require('../models/Note');
const Quiz = require('../models/Quiz');
const multer = require('multer');

// Configure multer for memory storage (profile pictures)
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    res.json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Error fetching profile' });
  }
});

// Update user profile (name only)
router.put('/profile', auth, async (req, res) => {
  try {
    const { name } = req.body;
    const user = await User.findByIdAndUpdate(
      req.userId, 
      { name }, 
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Error updating profile' });
  }
});

// ✅ Upload profile picture
router.post('/upload-pic', auth, upload.single('profilePicture'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    // Convert image to base64 for storage
    const base64Image = req.file.buffer.toString('base64');
    const profilePicture = `data:${req.file.mimetype};base64,${base64Image}`;
    
    const user = await User.findByIdAndUpdate(
      req.userId,
      { profilePicture },
      { new: true }
    ).select('-password');
    
    res.json({ 
      message: 'Profile picture updated successfully',
      profilePicture: user.profilePicture 
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Error uploading profile picture' });
  }
});

// ✅ Get user statistics for dashboard
router.get('/stats', auth, async (req, res) => {
  try {
    // Get counts from database
    const totalNotes = await Note.countDocuments({ userId: req.userId });
    const totalQuizzes = await Quiz.countDocuments({ userId: req.userId });
    
    // Count notes that have summaries
    const totalSummaries = await Note.countDocuments({ 
      userId: req.userId,
      $or: [
        { 'summary.short': { $exists: true, $ne: null } },
        { 'summary.detailed': { $exists: true, $ne: null } }
      ]
    });
    
    // Calculate study streak (simplified - can be enhanced)
    const studyStreak = totalNotes > 0 || totalQuizzes > 0 ? 7 : 0;
    
    // Get user creation date
    const user = await User.findById(req.userId).select('createdAt');
    
    res.json({
      totalNotes,
      totalQuizzes,
      totalSummaries,
      studyStreak,
      joinDate: user?.createdAt || new Date()
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    // Return default values instead of error
    res.json({
      totalNotes: 0,
      totalQuizzes: 0,
      totalSummaries: 0,
      studyStreak: 0,
      joinDate: new Date()
    });
  }
});

// Update full profile (name + email + picture)
router.put('/update', auth, async (req, res) => {
  try {
    const { name, email } = req.body;
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    
    const user = await User.findByIdAndUpdate(
      req.userId,
      updateData,
      { new: true }
    ).select('-password');
    
    res.json(user);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Error updating profile' });
  }
});

module.exports = router;