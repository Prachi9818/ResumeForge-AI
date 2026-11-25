const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, default: 'Main resume' },
  role: { type: String, default: 'Frontend Developer' },
  template: { type: String, enum: ['classic', 'modern', 'minimal', 'bold'], default: 'modern' },
  data: {
    name: { type: String, default: '' },
    title: { type: String, default: '' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    location: { type: String, default: '' },
    summary: { type: String, default: '' },
    education: [{ school: String, degree: String, year: String }],
    experience: [{ company: String, role: String, period: String, details: String }],
    projects: [{ name: String, tech: String, details: String }],
    skills: { type: String, default: '' },
    certs: { type: String, default: '' },
    achievements: { type: String, default: '' },
    languages: { type: String, default: '' }
  }
}, { timestamps: true });

module.exports = mongoose.model('Resume', resumeSchema);
