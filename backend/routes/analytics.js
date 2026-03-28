// routes/analytics.js
const express = require('express');
const router = express.Router();
const analyticsCtrl = require('../controllers/analyticsController');
const { auth } = require('../middleware/auth');
router.use(auth);
router.get('/dashboard', analyticsCtrl.getDashboard);
router.get('/leads/trend', analyticsCtrl.getLeadTrend);
router.get('/revenue', analyticsCtrl.getRevenue);
module.exports = router;
