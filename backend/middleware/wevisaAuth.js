// backend/middleware/wevisaAuth.js
const jwt = require('jsonwebtoken');
const { WeVisaAgent } = require('../models/wevisa');

const wevisaAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'Authentication required' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.platform !== 'wevisa') return res.status(401).json({ success: false, message: 'Invalid token platform' });

    const agent = await WeVisaAgent.findById(decoded.id).select('-password');
    if (!agent || agent.status === 'suspended') {
      return res.status(401).json({ success: false, message: 'Agent not found or suspended' });
    }
    req.agent = agent;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired', code: 'TOKEN_EXPIRED' });
    }
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

module.exports = { wevisaAuth };
