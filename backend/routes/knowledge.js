// routes/knowledge.js
const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { Knowledge } = require('../models');
router.use(auth);
router.get('/', async (req, res) => {
  try {
    const { country, category, search } = req.query;
    const query = { isActive: true };
    if (country) query.country = new RegExp(country, 'i');
    if (category) query.category = category;
    if (search) query.$text = { $search: search };
    const items = await Knowledge.find(query).sort({ views: -1 }).limit(50);
    res.json({ success: true, data: items });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});
router.post('/', async (req, res) => {
  try {
    const item = await Knowledge.create(req.body);
    res.status(201).json({ success: true, data: item });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});
router.put('/:id', async (req, res) => {
  try {
    const item = await Knowledge.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: item });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});
router.delete('/:id', async (req, res) => {
  try {
    await Knowledge.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});
module.exports = router;
