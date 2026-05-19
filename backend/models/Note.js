const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  fileName: String,
  fileUrl: String,
  fileType: String,
  category: { type: String, default: 'Study Notes' },
  summary: { short: String, detailed: String },
  uploadedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Note', noteSchema);