const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Quiz = require('../models/Quiz');
const Note = require('../models/Note');

// Get all quizzes for user (WITH questions)
router.get('/quizzes', auth, async (req, res) => {
  try {
    let quizzes = await Quiz.find({ userId: req.userId }).sort({ createdAt: -1 });
    
    console.log(`📋 Found ${quizzes.length} quizzes for user`);
    
    // If no quizzes, create sample quizzes
    if (quizzes.length === 0) {
      const sampleQuizzes = [
        {
          userId: req.userId,
          title: "JavaScript Fundamentals",
          difficulty: "Easy",
          questions: [
            {
              question: "What is JavaScript?",
              options: ["Programming Language", "Style Sheet", "Database", "Framework"],
              correctAnswer: 0,
              explanation: "JavaScript is a programming language for web development."
            },
            {
              question: "Which symbol is used for single-line comments in JavaScript?",
              options: ["<!-- -->", "//", "/* */", "#"],
              correctAnswer: 1,
              explanation: "// is used for single-line comments in JavaScript."
            },
            {
              question: "What does DOM stand for?",
              options: ["Document Object Model", "Data Object Model", "Document Oriented Model", "Data Oriented Model"],
              correctAnswer: 0,
              explanation: "DOM stands for Document Object Model."
            }
          ],
          attempts: [],
          createdAt: new Date()
        },
        {
          userId: req.userId,
          title: "React Basics",
          difficulty: "Medium",
          questions: [
            {
              question: "What is React?",
              options: ["JavaScript Library", "Framework", "Database", "Server"],
              correctAnswer: 0,
              explanation: "React is a JavaScript library for building user interfaces."
            },
            {
              question: "What is JSX?",
              options: ["JavaScript XML", "Java XML", "JSON XML", "JavaScript Extension"],
              correctAnswer: 0,
              explanation: "JSX stands for JavaScript XML."
            },
            {
              question: "Which hook is used for state in functional components?",
              options: ["useState", "useEffect", "useContext", "useReducer"],
              correctAnswer: 0,
              explanation: "useState is used for state management in functional components."
            },
            {
              question: "Which company created React?",
              options: ["Google", "Facebook (Meta)", "Twitter", "Microsoft"],
              correctAnswer: 1,
              explanation: "React was created by Facebook (now Meta)."
            }
          ],
          attempts: [],
          createdAt: new Date()
        },
        {
          userId: req.userId,
          title: "CSS Grid & Flexbox",
          difficulty: "Easy",
          questions: [
            {
              question: "What does CSS stand for?",
              options: ["Creative Style Sheets", "Computer Style Sheets", "Cascading Style Sheets", "Colorful Style Sheets"],
              correctAnswer: 2,
              explanation: "CSS stands for Cascading Style Sheets."
            },
            {
              question: "Which property creates a flex container?",
              options: ["display: flex", "position: flex", "container: flex", "flex: container"],
              correctAnswer: 0,
              explanation: "display: flex creates a flex container."
            },
            {
              question: "Which property creates a grid container?",
              options: ["display: grid", "display: block", "display: flex", "display: inline"],
              correctAnswer: 0,
              explanation: "display: grid creates a grid container."
            }
          ],
          attempts: [],
          createdAt: new Date()
        }
      ];
      
      await Quiz.insertMany(sampleQuizzes);
      quizzes = await Quiz.find({ userId: req.userId }).sort({ createdAt: -1 });
      console.log(`✅ Created ${quizzes.length} sample quizzes for new user`);
    }
    
    res.json(quizzes);
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    res.status(500).json({ message: 'Error fetching quizzes', error: error.message });
  }
});

// Get single quiz with questions
router.get('/quiz/:id', auth, async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ _id: req.params.id, userId: req.userId });
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    res.json(quiz);
  } catch (error) {
    console.error('Error fetching quiz:', error);
    res.status(500).json({ message: 'Error fetching quiz' });
  }
});

// Submit quiz attempt
router.post('/quiz/:id/submit', auth, async (req, res) => {
  try {
    const { answers, timeTaken } = req.body;
    const quiz = await Quiz.findOne({ _id: req.params.id, userId: req.userId });
    
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    
    let score = 0;
    quiz.questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        score++;
      }
    });
    
    const percentage = (score / quiz.questions.length) * 100;
    
    const attempt = {
      score: score,
      totalQuestions: quiz.questions.length,
      timeTaken: timeTaken || 0,
      date: new Date()
    };
    
    quiz.attempts.push(attempt);
    await quiz.save();
    
    res.json({
      success: true,
      score: score,
      totalQuestions: quiz.questions.length,
      percentage: percentage,
      message: `You scored ${score}/${quiz.questions.length} (${Math.round(percentage)}%)`
    });
    
  } catch (error) {
    console.error('Quiz submission error:', error);
    res.status(500).json({ message: 'Error submitting quiz' });
  }
});

// Generate Quiz from Note
router.post('/quiz/generate', auth, async (req, res) => {
  try {
    const { noteId, difficulty = 'Medium', numberOfQuestions = 5 } = req.body;
    
    console.log('🎯 Generating quiz for note:', noteId);
    
    const note = await Note.findOne({ _id: noteId, userId: req.userId });
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    
    const sampleQuestions = [
      {
        question: `What is the main topic of "${note.title}"?`,
        options: ['Introduction and basics', 'Advanced concepts', 'Practical applications', 'Summary and conclusion'],
        correctAnswer: 0,
        explanation: 'The main topic covers the fundamental concepts.'
      },
      {
        question: `Which of the following is most relevant to ${note.title}?`,
        options: ['Theoretical knowledge', 'Practical implementation', 'Historical context', 'Future trends'],
        correctAnswer: 1,
        explanation: 'Practical implementation is key to understanding this topic.'
      },
      {
        question: `What is a key takeaway from "${note.title}"?`,
        options: ['Basic understanding', 'Advanced techniques', 'Real-world applications', 'All of the above'],
        correctAnswer: 3,
        explanation: 'The material covers basics, techniques, and applications.'
      }
    ];
    
    const questions = sampleQuestions.slice(0, numberOfQuestions);
    
    const quiz = new Quiz({
      userId: req.userId,
      noteId: note._id,
      title: `${note.title} - Quiz`,
      difficulty: difficulty,
      questions: questions,
      createdAt: new Date()
    });
    
    await quiz.save();
    console.log('✅ Quiz created:', quiz._id);
    
    res.status(201).json({
      success: true,
      quizId: quiz._id,
      title: quiz.title,
      difficulty: quiz.difficulty,
      questions: quiz.questions,
      totalQuestions: quiz.questions.length
    });
    
  } catch (error) {
    console.error('Quiz generation error:', error);
    res.status(500).json({ message: 'Error generating quiz', error: error.message });
  }
});

module.exports = router;