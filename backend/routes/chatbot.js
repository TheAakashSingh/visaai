// routes/chatbot.js
const express = require('express');
const router = express.Router();
const chatCtrl = require('../controllers/chatbotController');
const { auth } = require('../middleware/auth');

router.post('/chat', chatCtrl.chat); // public for widget
router.use(auth);
router.post('/send', chatCtrl.sendMessage);
router.get('/conversations', chatCtrl.getConversations);
router.get('/stats', chatCtrl.getStats);

module.exports = router;
