// routes/ocr.js
const express = require('express');
const router = express.Router();
const ocrCtrl = require('../controllers/ocrController');
const { auth } = require('../middleware/auth');
router.use(auth);
router.post('/process', ocrCtrl.uploadMiddleware, ocrCtrl.processDocument);
router.get('/documents', ocrCtrl.getDocuments);
router.get('/stats', ocrCtrl.getStats);
module.exports = router;
