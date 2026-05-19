const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'EduMate AI Backend is working!' });
});

// ✅ ALL ROUTES ENABLED
app.use('/api/auth', require('./routes/auth'));
app.use('/api/notes', require('./routes/notes'));     // Enable karo
app.use('/api/ai', require('./routes/ai'));           // Enable karo
app.use('/api/user', require('./routes/user'));       // Enable karo
app.use('/api/history', require('./routes/history')); // Enable karo - NAYA ROUTE

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB Connected Successfully!');
    console.log('📍 Database:', mongoose.connection.db.databaseName);
  })
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err.message);
  });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 http://localhost:${PORT}`);
  console.log(`📋 Available routes:`);
  console.log(`   POST /api/auth/signup`);
  console.log(`   POST /api/auth/login`);
  console.log(`   GET  /api/notes`);
  console.log(`   POST /api/notes`);
  console.log(`   GET  /api/history/all`);
});