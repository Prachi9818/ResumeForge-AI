const express = require('express');
const Resume = require('../models/Resume');
const auth = require('../middleware/auth');

const router = express.Router();
router.use(auth);

// GET /api/resumes
router.get('/', async (req, res) => {
  try {
    const resumes = await Resume.find({ user: req.userId }).sort({ createdAt: 1 });
    res.json(resumes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/resumes
router.post('/', async (req, res) => {
  try {
    const resume = await Resume.create({ ...req.body, user: req.userId });
    res.status(201).json(resume);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/resumes/:id
router.put('/:id', async (req, res) => {
  try {
    const updated = await Resume.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Resume not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/resumes/:id
router.delete('/:id', async (req, res) => {
  try {
    const count = await Resume.countDocuments({ user: req.userId });
    if (count <= 1) return res.status(400).json({ message: 'Cannot delete the last resume' });

    await Resume.findOneAndDelete({ _id: req.params.id, user: req.userId });
    res.json({ message: 'Resume deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
