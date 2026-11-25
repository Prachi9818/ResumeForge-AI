const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  activeResumeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resume', default: null },
  skillProgress: { type: Map, of: Number, default: {} },
  roadmapDone: { type: Map, of: Boolean, default: {} },
  lastMatch: {
    score: { type: Number, default: null },
    title: { type: String, default: '' }
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
