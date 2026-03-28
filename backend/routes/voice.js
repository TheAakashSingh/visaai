// routes/voice.js
const express = require('express');
const router = express.Router();
const voiceCtrl = require('../controllers/voiceController');
const { auth } = require('../middleware/auth');

router.use(auth);
router.post('/call', voiceCtrl.makeCall);
router.post('/appointment-confirm', voiceCtrl.confirmAppointment);
router.post('/status-update', voiceCtrl.sendStatusUpdate);
router.post('/survey', voiceCtrl.conductSurvey);
router.post('/reengage', voiceCtrl.reengageDormantLead);
router.get('/logs', voiceCtrl.getCallLogs);
router.get('/stats', voiceCtrl.getStats);

module.exports = router;