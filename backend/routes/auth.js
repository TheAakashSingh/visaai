// routes/auth.js
const express = require('express');
const router = express.Router();
const authCtrl = require('../controllers/authController');
const { auth } = require('../middleware/auth');

router.post('/register', authCtrl.register);
router.post('/login', authCtrl.login);
router.post('/refresh', authCtrl.refresh);
router.post('/logout', auth, authCtrl.logout);
router.get('/me', auth, authCtrl.getMe);

module.exports = router;
