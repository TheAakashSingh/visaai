// backend/middleware/adminAuth.js
const jwt = require('jsonwebtoken');
const { WeVisaAdmin } = require('../models/wevisaAdmin');

const adminAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'Admin authentication required' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.platform !== 'wevisa-admin') return res.status(401).json({ success: false, message: 'Invalid token' });
    const admin = await WeVisaAdmin.findById(decoded.id).select('-password');
    if (!admin || !admin.isActive) return res.status(401).json({ success: false, message: 'Admin not found or inactive' });
    req.admin = admin;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') return res.status(401).json({ success: false, message: 'Token expired', code: 'TOKEN_EXPIRED' });
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

module.exports = { adminAuth };
