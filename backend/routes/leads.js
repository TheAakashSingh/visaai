// routes/leads.js
const express = require('express');
const router = express.Router();
const leadsCtrl = require('../controllers/leadsController');
const { auth } = require('../middleware/auth');

router.use(auth);
router.get('/stats/summary', leadsCtrl.getStats);
router.get('/', leadsCtrl.getLeads);
router.get('/:id', leadsCtrl.getLead);
router.post('/', leadsCtrl.createLead);
router.put('/:id', leadsCtrl.updateLead);
router.delete('/:id', leadsCtrl.deleteLead);
router.post('/:id/score', leadsCtrl.scoreLead);

module.exports = router;
