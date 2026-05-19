const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Note = require('../models/Note');
const Quiz = require('../models/Quiz');

// Get all user activity history
router.get('/all', auth, async (req, res) => {
  try {
    console.log('📜 Fetching history for user:', req.userId);
    
    // Get notes
    const notes = await Note.find({ userId: req.userId })
      .sort({ uploadedAt: -1 })
      .limit(50);
    
    // Get quizzes
    const quizzes = await Quiz.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(50);
    
    console.log(`📊 Found: ${notes.length} notes, ${quizzes.length} quizzes`);
    
    // Format notes
    const notesHistory = notes.map(note => ({
      id: note._id,
      type: 'note',
      icon: '📤',
      title: note.title,
      date: note.uploadedAt,
      action: 'Uploaded Note',
      details: `${note.fileName || note.title} • ${(note.fileSize / 1024).toFixed(2)} KB`
    }));
    
    // Format quizzes
    const quizzesHistory = quizzes.map(quiz => ({
      id: quiz._id,
      type: 'quiz',
      icon: '📝',
      title: quiz.title,
      date: quiz.createdAt,
      action: 'Generated Quiz',
      details: `${quiz.questions?.length || 0} questions • ${quiz.difficulty || 'Medium'} difficulty`,
      attempts: quiz.attempts?.length || 0,
      bestScore: quiz.attempts?.length > 0 
        ? Math.max(...quiz.attempts.map(a => (a.score / a.totalQuestions) * 100)) 
        : 0
    }));
    
    // Combine and sort by date
    const history = [...notesHistory, ...quizzesHistory];
    history.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    res.json(history);
  } catch (error) {
    console.error('History fetch error:', error);
    res.status(500).json({ message: 'Error fetching history', error: error.message });
  }
});

module.exports = router;