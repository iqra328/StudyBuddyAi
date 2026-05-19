const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Note = require('../models/Note');
const multer = require('multer');
const path = require('path');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, DOCX, TXT allowed.'));
    }
  }
});

// Upload note with file
router.post('/', auth, upload.single('file'), async (req, res) => {
  try {
    console.log('📤 Upload request received');
    console.log('Body:', req.body);
    console.log('File:', req.file ? req.file.originalname : 'No file');
    
    const { title, category, fileName, fileType } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    // Convert file to base64 for storage (temporary - use Cloudinary in production)
    const base64File = req.file.buffer.toString('base64');
    const fileUrl = `data:${req.file.mimetype};base64,${base64File}`;
    
    const note = new Note({
      userId: req.userId,
      title: title || req.file.originalname.replace(/\.[^/.]+$/, ''),
      fileName: req.file.originalname,
      fileUrl: fileUrl,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      category: category || 'Study Notes',
      uploadedAt: new Date()
    });
    
    await note.save();
    console.log('✅ Note saved:', note._id);
    
    res.status(201).json({ 
      message: 'File uploaded successfully',
      note: {
        id: note._id,
        title: note.title,
        fileName: note.fileName,
        uploadedAt: note.uploadedAt
      }
    });
  } catch (error) {
    console.error('❌ Upload error:', error);
    res.status(500).json({ message: 'Error uploading file', error: error.message });
  }
});

// Get all notes for user
router.get('/', auth, async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.userId })
      .sort({ uploadedAt: -1 })
      .select('-fileUrl'); // Exclude file data for list view
    
    console.log(`📋 Found ${notes.length} notes for user ${req.userId}`);
    res.json(notes);
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).json({ message: 'Error fetching notes' });
  }
});

// Get single note with file
router.get('/:id', auth, async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.userId });
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    res.json(note);
  } catch (error) {
    console.error('Error fetching note:', error);
    res.status(500).json({ message: 'Error fetching note' });
  }
});

// Delete note
router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await Note.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!result) {
      return res.status(404).json({ message: 'Note not found' });
    }
    console.log('🗑️ Note deleted:', req.params.id);
    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).json({ message: 'Error deleting note' });
  }
});

module.exports = router;