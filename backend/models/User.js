const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profilePicture: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  studyStats: {
    totalNotes: { type: Number, default: 0 },
    totalQuizzes: { type: Number, default: 0 },
    totalSummaries: { type: Number, default: 0 }
  }
});

// Check if model already exists before creating
module.exports = mongoose.models.User || mongoose.model('User', userSchema);