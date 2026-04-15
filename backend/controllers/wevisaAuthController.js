// backend/controllers/wevisaAuthController.js
const jwt = require('jsonwebtoken');
const { WeVisaAgent } = require('../models/wevisa');
const logger = require('../utils/logger');

const generateTokens = (id) => ({
  accessToken: jwt.sign({ id, platform: 'wevisa' }, process.env.JWT_SECRET, { expiresIn: '7d' }),
  refreshToken: jwt.sign({ id, platform: 'wevisa' }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '30d' }),
});

// POST /api/wevisa/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, agencyName, agencyType, city, state } = req.body;
    if (!name || !email || !password || !phone || !agencyName) {
      return res.status(400).json({ success: false, message: 'All required fields must be provided' });
    }
    const exists = await WeVisaAgent.findOne({ email });
    if (exists) return res.status(409).json({ success: false, message: 'Email already registered' });

    const agent = await WeVisaAgent.create({ name, email, password, phone, agencyName, agencyType: agencyType || 'individual', city, state });
    const { accessToken, refreshToken } = generateTokens(agent._id);
    agent.refreshToken = refreshToken;
    await agent.save();

    logger.info(`WeVisa agent registered: ${email}`);
    res.status(201).json({ success: true, message: 'Registration successful! Welcome to WeVisa.', data: { agent, accessToken, refreshToken } });
  } catch (err) {
    logger.error('WeVisa register error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/wevisa/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const agent = await WeVisaAgent.findOne({ email }).select('+password');
    if (!agent || !(await agent.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    if (agent.status === 'suspended') {
      return res.status(403).json({ success: false, message: 'Account suspended. Contact support.' });
    }
    agent.lastLogin = new Date();
    const { accessToken, refreshToken } = generateTokens(agent._id);
    agent.refreshToken = refreshToken;
    await agent.save();

    res.json({ success: true, data: { agent, accessToken, refreshToken } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/wevisa/auth/refresh
exports.refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const agent = await WeVisaAgent.findById(decoded.id);
    if (!agent || agent.refreshToken !== refreshToken) {
      return res.status(401).json({ success: false, message: 'Invalid refresh token' });
    }
    const tokens = generateTokens(agent._id);
    agent.refreshToken = tokens.refreshToken;
    await agent.save();
    res.json({ success: true, data: tokens });
  } catch {
    res.status(401).json({ success: false, message: 'Invalid refresh token' });
  }
};

// GET /api/wevisa/auth/me
exports.getMe = async (req, res) => {
  try {
    const agent = await WeVisaAgent.findById(req.agent._id);
    res.json({ success: true, data: agent });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/wevisa/auth/profile
exports.updateProfile = async (req, res) => {
  try {
    const allowed = ['name', 'phone', 'agencyName', 'city', 'state', 'gstin', 'panNumber', 'bankDetails'];
    const updates = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });
    const agent = await WeVisaAgent.findByIdAndUpdate(req.agent._id, updates, { new: true });
    res.json({ success: true, data: agent });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/wevisa/auth/logout
exports.logout = async (req, res) => {
  try {
    await WeVisaAgent.findByIdAndUpdate(req.agent._id, { refreshToken: null });
    res.json({ success: true, message: 'Logged out' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
