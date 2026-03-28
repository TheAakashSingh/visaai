// routes/settings.js
const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { Settings } = require('../models');
router.use(auth);
router.get('/', async (req, res) => {
  try {
    let s = await Settings.findOne({ userId: req.user._id });
    if (!s) s = await Settings.create({ userId: req.user._id });
    res.json({ success: true, data: s });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});
router.put('/', async (req, res) => {
  try {
    const s = await Settings.findOneAndUpdate(
      { userId: req.user._id },
      { $set: req.body },
      { new: true, upsert: true }
    );
    res.json({ success: true, data: s });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});
module.exports = router;
