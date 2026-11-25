const express = require('express');
const Application = require('../models/Application');
const auth = require('../middleware/auth');

const router = express.Router();
router.use(auth);

// GET /api/applications
router.get('/', async (req, res) => {
  try {
    const apps = await Application.find({ user: req.userId }).sort({ createdAt: -1 });
    res.json(apps);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/applications
router.post('/', async (req, res) => {
  try {
    const app = await Application.create({ ...req.body, user: req.userId });
    res.status(201).json(app);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/applications/:id
router.put('/:id', async (req, res) => {
  try {
    const updated = await Application.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Application not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/applications/:id
router.delete('/:id', async (req, res) => {
  try {
    await Application.findOneAndDelete({ _id: req.params.id, user: req.userId });
    res.json({ message: 'Application deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
