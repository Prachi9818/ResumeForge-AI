const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();
router.use(auth);

// PUT /api/progress
router.put('/', async (req, res) => {
  try {
    const { skillProgress, roadmapDone, lastMatch, activeResumeId } = req.body;
    const update = {};
    if (skillProgress) update.skillProgress = skillProgress;
    if (roadmapDone) update.roadmapDone = roadmapDone;
    if (lastMatch !== undefined) update.lastMatch = lastMatch;
    if (activeResumeId) update.activeResumeId = activeResumeId;

    const user = await User.findByIdAndUpdate(req.userId, update, { new: true }).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
