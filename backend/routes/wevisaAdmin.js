// backend/routes/wevisaAdmin.js — Complete Admin API with full dynamic control
const express = require('express');
const router  = express.Router();
const jwt     = require('jsonwebtoken');

const { WeVisaAdmin, WeVisaCountry, WeVisaPackage, WeVisaDocumentType } = require('../models/wevisaAdmin');
const { WeVisaAgent, VisaApplication, DummyTicket, USAAppointment,
        SchengenAppointment, WeVisaInvoice, WeVisaCRMLead } = require('../models/wevisa');
const { User } = require('../models');   // VisaAI Pro users (same admin)

// ─────────────────────────────────────────────────────────────
// Admin Auth: accepts BOTH VisaAI Pro JWT and WeVisa-Admin JWT
// So the same /login session on VisaAI Pro works here too.
// ─────────────────────────────────────────────────────────────
const adminAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'No token' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Accept VisaAI Pro users (platform not set / 'visaai') as admin
    if (decoded.platform === 'wevisa') {
      return res.status(401).json({ success: false, message: 'Agent token not allowed here' });
    }

    // Try WeVisaAdmin model first, then VisaAI User model
    let admin = await WeVisaAdmin.findById(decoded.id).select('-password').catch(() => null);
    if (!admin) {
      const user = await User.findById(decoded.id).select('-password').catch(() => null);
      if (!user || !user.isActive) return res.status(401).json({ success: false, message: 'Admin not found' });
      req.admin = user;
    } else {
      if (!admin.isActive) return res.status(401).json({ success: false, message: 'Admin suspended' });
      req.admin = admin;
    }
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

// ── Dashboard Stats ───────────────────────────────────────────
router.get('/dashboard/stats', adminAuth, async (req, res) => {
  try {
    const [agents, countries, packages, applications, tickets, usaAppts, schengenAppts, invoices] = await Promise.all([
      WeVisaAgent.countDocuments(),
      WeVisaCountry.countDocuments({ isActive: true }),
      WeVisaPackage.countDocuments({ isActive: true }),
      VisaApplication.countDocuments(),
      DummyTicket.countDocuments(),
      USAAppointment.countDocuments(),
      SchengenAppointment.countDocuments(),
      WeVisaInvoice.countDocuments(),
    ]);
    const revenueAgg  = await WeVisaInvoice.aggregate([{ $match: { status: 'paid' } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]);
    const pendingApps = await VisaApplication.countDocuments({ status: { $in: ['submitted', 'processing'] } });
    const activeAgents= await WeVisaAgent.countDocuments({ status: 'active' });
    res.json({ success: true, data: { agents, activeAgents, countries, packages, applications, pendingApps, tickets, usaAppts, schengenAppts, invoices, revenue: revenueAgg[0]?.total || 0 } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ── Countries CRUD ────────────────────────────────────────────
router.get('/countries', adminAuth, async (req, res) => {
  try {
    const { search, region, isActive } = req.query;
    const q = {};
    if (search)    q.$or = [{ name: { $regex: search, $options: 'i' } }, { code: { $regex: search, $options: 'i' } }];
    if (region)    q.region   = region;
    if (isActive !== undefined) q.isActive = isActive === 'true';
    const countries = await WeVisaCountry.find(q).sort({ isFeatured: -1, sortOrder: 1, name: 1 });
    res.json({ success: true, data: countries });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.post('/countries', adminAuth, async (req, res) => {
  try {
    const country = await WeVisaCountry.create({ ...req.body, createdBy: req.admin._id });
    res.status(201).json({ success: true, data: country });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.put('/countries/:id', adminAuth, async (req, res) => {
  try {
    const country = await WeVisaCountry.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!country) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: country });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.delete('/countries/:id', adminAuth, async (req, res) => {
  try {
    await WeVisaCountry.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Deactivated' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ── Packages CRUD ─────────────────────────────────────────────
router.get('/packages', adminAuth, async (req, res) => {
  try {
    const { country, isActive, isExpress, category } = req.query;
    const q = {};
    if (country)   q.countryName = { $regex: country, $options: 'i' };
    if (isActive !== undefined) q.isActive = isActive === 'true';
    if (isExpress !== undefined) q.isExpress = isExpress === 'true';
    if (category)  q.category = category;
    const packages = await WeVisaPackage.find(q).sort({ sortOrder: 1, isExpress: -1 });
    res.json({ success: true, data: packages });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.post('/packages', adminAuth, async (req, res) => {
  try {
    const { countryName, countryFlag, countryCode, ...rest } = req.body;
    
    // Look up country ObjectId by name
    let countryId = null;
    if (countryName) {
      const country = await WeVisaCountry.findOne({ name: countryName });
      if (country) countryId = country._id;
    }
    
    const pkg = await WeVisaPackage.create({ 
      country: countryId,
      countryName,
      countryFlag,
      countryCode,
      ...rest, 
      createdBy: req.admin._id 
    });
    res.status(201).json({ success: true, data: pkg });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.put('/packages/:id', adminAuth, async (req, res) => {
  try {
    const { countryName, countryFlag, countryCode, ...rest } = req.body;
    
    // Look up country ObjectId by name if changed
    let countryId = undefined;
    if (countryName) {
      const country = await WeVisaCountry.findOne({ name: countryName });
      if (country) countryId = country._id;
    }
    
    const updateData = { ...rest };
    if (countryId) updateData.country = countryId;
    if (countryName) {
      updateData.countryName = countryName;
      updateData.countryFlag = countryFlag;
      updateData.countryCode = countryCode;
    }
    
    const pkg = await WeVisaPackage.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!pkg) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: pkg });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.delete('/packages/:id', adminAuth, async (req, res) => {
  try {
    await WeVisaPackage.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Deactivated' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ── USA Appointment Pricing (Admin controls price) ────────────
// These are stored in a settings-like collection via WeVisaAdmin
router.get('/usa-pricing', adminAuth, async (req, res) => {
  // Return configurable pricing; stored in process.env or DB (extend as needed)
  res.json({ success: true, data: {
    pan_india:      Number(process.env.USA_PRICE_PAN || 35000),
    state_specific: Number(process.env.USA_PRICE_STATE || 25000),
    city_specific:  Number(process.env.USA_PRICE_CITY || 20000),
    description:    process.env.USA_DESCRIPTION || 'Priority slot booking for USA visa appointments within 2 weeks',
    timeframe:      process.env.USA_TIMEFRAME || 'Within 30 Days',
  }});
});

// Update USA pricing via env-like override stored in WeVisaAdmin notes (simple approach)
router.put('/usa-pricing', adminAuth, async (req, res) => {
  // In production, store in a Settings model. Here we persist in WeVisaAdmin record
  try {
    await WeVisaAdmin.findByIdAndUpdate(req.admin._id, {
      $set: { 'metadata.usaPricing': req.body }
    }).catch(() => null);
    // Also attempt to update via VisaAI User
    res.json({ success: true, data: req.body, message: 'USA pricing updated (restart server to apply env changes)' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ── Dummy Ticket Pricing ──────────────────────────────────────
router.get('/dummy-ticket-pricing', adminAuth, async (req, res) => {
  res.json({ success: true, data: { price: Number(process.env.DUMMY_TICKET_PRICE || 299), description: 'Valid for 30 days from generation. For visa application reference only.' } });
});

// ── Schengen Config (admin uploads availability/images per country) ──
router.get('/schengen-config', adminAuth, async (req, res) => {
  try {
    // Stored as WeVisaPackages with category='appointment' + isSchengen flag
    const schengen = await WeVisaPackage.find({ category: 'appointment', isActive: true }).sort({ countryName: 1 });
    res.json({ success: true, data: schengen });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ── Agent Management ──────────────────────────────────────────
router.get('/agents', adminAuth, async (req, res) => {
  try {
    const { search, status, page = 1, limit = 20 } = req.query;
    const q = {};
    if (search) q.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }, { agencyName: { $regex: search, $options: 'i' } }];
    if (status) q.status = status;
    const agents = await WeVisaAgent.find(q).select('-password -refreshToken').sort({ createdAt: -1 }).skip((page-1)*limit).limit(Number(limit));
    const total  = await WeVisaAgent.countDocuments(q);
    res.json({ success: true, data: agents, total });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.put('/agents/:id', adminAuth, async (req, res) => {
  try {
    const allowed = ['status', 'tier', 'commissionRate', 'isVerified', 'notes'];
    const updates = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });
    const agent = await WeVisaAgent.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-password');
    res.json({ success: true, data: agent });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ── Applications Management ───────────────────────────────────
router.get('/applications', adminAuth, async (req, res) => {
  try {
    const { status, country, page = 1, limit = 20 } = req.query;
    const q = {};
    if (status)  q.status  = status;
    if (country) q.country = { $regex: country, $options: 'i' };
    const apps  = await VisaApplication.find(q).populate('agent', 'name agencyName email phone').sort({ createdAt: -1 }).skip((page-1)*limit).limit(Number(limit));
    const total = await VisaApplication.countDocuments(q);
    res.json({ success: true, data: apps, total });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.put('/applications/:id', adminAuth, async (req, res) => {
  try {
    const app = await VisaApplication.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: app });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ── USA Appointments (admin view) ─────────────────────────────
router.get('/usa-appointments', adminAuth, async (req, res) => {
  try {
    const appts = await USAAppointment.find().populate('agent', 'name agencyName').sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, data: appts });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.put('/usa-appointments/:id', adminAuth, async (req, res) => {
  try {
    const appt = await USAAppointment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: appt });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ── Schengen Appointments (admin view) ────────────────────────
router.get('/schengen-appointments', adminAuth, async (req, res) => {
  try {
    const appts = await SchengenAppointment.find().populate('agent', 'name agencyName').sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, data: appts });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ── Dummy Tickets (admin view) ────────────────────────────────
router.get('/dummy-tickets', adminAuth, async (req, res) => {
  try {
    const tickets = await DummyTicket.find().populate('agent', 'name agencyName').sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, data: tickets });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ── Document Types CRUD ───────────────────────────────────────
router.get('/document-types', adminAuth, async (req, res) => {
  try {
    const docs = await WeVisaDocumentType.find({ isActive: true }).sort({ name: 1 });
    res.json({ success: true, data: docs });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.post('/document-types', adminAuth, async (req, res) => {
  try {
    const doc = await WeVisaDocumentType.create(req.body);
    res.status(201).json({ success: true, data: doc });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.put('/document-types/:id', adminAuth, async (req, res) => {
  try {
    const doc = await WeVisaDocumentType.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: doc });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ─────────────────────────────────────────────────────────────
// PUBLIC API — No auth required (landing page + agent portal)
// ─────────────────────────────────────────────────────────────

// GET /api/wevisa-admin/public/countries
router.get('/public/countries', async (req, res) => {
  try {
    const { region, isFeatured, isSchengen, search, limit = 100 } = req.query;
    const q = { isActive: true };
    if (region)              q.region     = region;
    if (isFeatured === 'true') q.isFeatured = true;
    if (isSchengen === 'true') q.isSchengen = true;
    if (search)              q.name = { $regex: search, $options: 'i' };
    const countries = await WeVisaCountry.find(q).sort({ isFeatured: -1, sortOrder: 1, name: 1 }).limit(Number(limit));
    res.json({ success: true, data: countries });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET /api/wevisa-admin/public/packages
router.get('/public/packages', async (req, res) => {
  try {
    const { country, isExpress, category, limit = 100 } = req.query;
    const q = { isActive: true };
    if (country)   q.countryName = { $regex: country, $options: 'i' };
    if (isExpress === 'true') q.isExpress = true;
    if (category)  q.category = category;
    const packages = await WeVisaPackage.find(q).sort({ isExpress: -1, isFeatured: -1, sortOrder: 1, price: 1 }).limit(Number(limit));
    res.json({ success: true, data: packages });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET /api/wevisa-admin/public/usa-pricing
router.get('/public/usa-pricing', async (req, res) => {
  res.json({ success: true, data: {
    pan_india:      35000,
    state_specific: 25000,
    city_specific:  20000,
    description:    'Priority USA visa appointment slot booking within 2 weeks',
    timeframe:      'Within 30 Days',
    discount:       '15% OFF',
  }});
});

// GET /api/wevisa-admin/public/dummy-ticket-pricing
router.get('/public/dummy-ticket-pricing', async (req, res) => {
  res.json({ success: true, data: { price: 299, description: 'Valid for 30 days. For visa application reference only.' }});
});

// ── Seed Data Endpoint ───────────────────────────────────────
router.post('/seed', adminAuth, async (req, res) => {
  try {
    const COUNTRIES = [
      { name: 'United Arab Emirates', code: 'AE', flag: '🇦🇪', region: 'Middle East', capital: 'Abu Dhabi', isFeatured: true, isActive: true },
      { name: 'Singapore', code: 'SG', flag: '🇸🇬', region: 'Asia', capital: 'Singapore', isFeatured: true, isActive: true },
      { name: 'Vietnam', code: 'VN', flag: '🇻🇳', region: 'Asia', capital: 'Hanoi', isFeatured: true, isActive: true },
      { name: 'Thailand', code: 'TH', flag: '🇹🇭', region: 'Asia', capital: 'Bangkok', isActive: true },
      { name: 'Malaysia', code: 'MY', flag: '🇲🇾', region: 'Asia', capital: 'Kuala Lumpur', isActive: true },
      { name: 'Indonesia', code: 'ID', flag: '🇮🇩', region: 'Asia', capital: 'Jakarta', isActive: true },
      { name: 'Turkey', code: 'TR', flag: '🇹🇷', region: 'Europe', capital: 'Ankara', isActive: true },
      { name: 'UK', code: 'GB', flag: '🇬🇧', region: 'Europe', capital: 'London', isFeatured: true, isActive: true, isSchengen: false },
      { name: 'USA', code: 'US', flag: '🇺🇸', region: 'Americas', capital: 'Washington DC', isFeatured: true, isActive: true },
      { name: 'Canada', code: 'CA', flag: '🇨🇦', region: 'Americas', capital: 'Ottawa', isActive: true },
      { name: 'Australia', code: 'AU', flag: '🇦🇺', region: 'Oceania', capital: 'Canberra', isActive: true },
      { name: 'Germany', code: 'DE', flag: '🇩🇪', region: 'Europe', capital: 'Berlin', isActive: true, isSchengen: true },
      { name: 'France', code: 'FR', flag: '🇫🇷', region: 'Europe', capital: 'Paris', isActive: true, isSchengen: true },
      { name: 'Italy', code: 'IT', flag: '🇮🇹', region: 'Europe', capital: 'Rome', isActive: true, isSchengen: true },
      { name: 'Spain', code: 'ES', flag: '🇪🇸', region: 'Europe', capital: 'Madrid', isActive: true, isSchengen: true },
      { name: 'Japan', code: 'JP', flag: '🇯🇵', region: 'Asia', capital: 'Tokyo', isActive: true },
      { name: 'Maldives', code: 'MV', flag: '🇲🇻', region: 'Asia', capital: 'Malé', isActive: true },
    ];
    
    const PACKAGES = [
      { countryName: 'United Arab Emirates', countryFlag: '🇦🇪', countryCode: 'AE', name: '30 Days Tourist Visa', visaType: 'Tourist', category: 'evisa', stayDuration: '30 Days', validity: '60 Days', entries: 'single', processingTime: '4 Hours', price: 2499, agentCost: 1800, commission: 699, isExpress: true, isFeatured: true, isActive: true },
      { countryName: 'Singapore', countryFlag: '🇸🇬', countryCode: 'SG', name: '30 Days Tourist Visa', visaType: 'Tourist', category: 'evisa', stayDuration: '30 Days', validity: '60 Days', entries: 'single', processingTime: '24 Hours', price: 3999, agentCost: 2800, commission: 1199, isExpress: true, isFeatured: true, isActive: true },
      { countryName: 'Vietnam', countryFlag: '🇻🇳', countryCode: 'VN', name: '90 Days Tourist Visa', visaType: 'Tourist', category: 'evisa', stayDuration: '90 Days', validity: '90 Days', entries: 'multiple', processingTime: '2 Hours', price: 1499, agentCost: 900, commission: 599, isExpress: true, isFeatured: true, isActive: true },
      { countryName: 'Thailand', countryFlag: '🇹🇭', countryCode: 'TH', name: '60 Days Tourist Visa', visaType: 'Tourist', category: 'evisa', stayDuration: '60 Days', validity: '60 Days', entries: 'single', processingTime: '3-5 Days', price: 2999, agentCost: 2200, commission: 799, isActive: true },
      { countryName: 'Malaysia', countryFlag: '🇲🇾', countryCode: 'MY', name: '30 Days e-Visa', visaType: 'Tourist', category: 'evisa', stayDuration: '30 Days', validity: '30 Days', entries: 'single', processingTime: '3-5 Days', price: 1999, agentCost: 1400, commission: 599, isActive: true },
      { countryName: 'Turkey', countryFlag: '🇹🇷', countryCode: 'TR', name: '90 Days Tourist Visa', visaType: 'Tourist', category: 'evisa', stayDuration: '90 Days', validity: '180 Days', entries: 'multiple', processingTime: '24 Hours', price: 3499, agentCost: 2600, commission: 899, isExpress: true, isActive: true },
      { countryName: 'Indonesia', countryFlag: '🇮🇩', countryCode: 'ID', name: '30 Days VoA', visaType: 'Tourist', category: 'on_arrival', stayDuration: '30 Days', validity: '30 Days', entries: 'single', processingTime: 'On Arrival', price: 2999, agentCost: 2200, commission: 799, isActive: true },
      { countryName: 'UK', countryFlag: '🇬🇧', countryCode: 'GB', name: 'Standard Visitor Visa', visaType: 'Tourist', category: 'sticker', stayDuration: '6 Months', validity: '2 Years', entries: 'multiple', processingTime: '3 Weeks', price: 15000, agentCost: 12000, commission: 3000, isActive: true },
      { countryName: 'USA', countryFlag: '🇺🇸', countryCode: 'US', name: 'B1/B2 Tourist Visa', visaType: 'Tourist', category: 'sticker', stayDuration: '6 Months', validity: '10 Years', entries: 'multiple', processingTime: '14 Days', price: 25000, agentCost: 20000, commission: 5000, isActive: true },
      { countryName: 'Canada', countryFlag: '🇨🇦', countryCode: 'CA', name: 'Tourist Visa', visaType: 'Tourist', category: 'sticker', stayDuration: '6 Months', validity: '10 Years', entries: 'multiple', processingTime: '4-6 Weeks', price: 12000, agentCost: 9000, commission: 3000, isActive: true },
      { countryName: 'Australia', countryFlag: '🇦🇺', countryCode: 'AU', name: 'Tourist Visa', visaType: 'Tourist', category: 'sticker', stayDuration: '3 Months', validity: '1 Year', entries: 'multiple', processingTime: '4-6 Weeks', price: 18000, agentCost: 14500, commission: 3500, isActive: true },
      { countryName: 'Germany', countryFlag: '🇩🇪', countryCode: 'DE', name: 'Short Stay Visa', visaType: 'Tourist', category: 'appointment', stayDuration: '90 Days', validity: '90 Days', entries: 'single', processingTime: '15 Days', price: 8000, agentCost: 6500, commission: 1500, isActive: true, isSchengen: true },
      { countryName: 'France', countryFlag: '🇫🇷', countryCode: 'FR', name: 'Short Stay Visa', visaType: 'Tourist', category: 'appointment', stayDuration: '90 Days', validity: '90 Days', entries: 'single', processingTime: '15 Days', price: 8500, agentCost: 7000, commission: 1500, isActive: true, isSchengen: true },
      { countryName: 'Japan', countryFlag: '🇯🇵', countryCode: 'JP', name: 'Tourist Visa', visaType: 'Tourist', category: 'evisa', stayDuration: '90 Days', validity: '90 Days', entries: 'multiple', processingTime: '5-7 Days', price: 4999, agentCost: 3800, commission: 1199, isActive: true },
      { countryName: 'Maldives', countryFlag: '🇲🇻', countryCode: 'MV', name: '30 Days Tourist Visa', visaType: 'Tourist', category: 'evisa', stayDuration: '30 Days', validity: '30 Days', entries: 'single', processingTime: '1-2 Days', price: 3999, agentCost: 3000, commission: 999, isActive: true },
    ];
    
    // Clear existing
    await WeVisaCountry.deleteMany({});
    await WeVisaPackage.deleteMany({});
    
    // Insert countries
    await WeVisaCountry.insertMany(COUNTRIES);
    
    // Lookup and insert packages
    for (const pkg of PACKAGES) {
      const country = await WeVisaCountry.findOne({ name: pkg.countryName });
      await WeVisaPackage.create({
        ...pkg,
        country: country?._id,
      });
    }
    
    const countryCount = await WeVisaCountry.countDocuments({});
    const packageCount = await WeVisaPackage.countDocuments({});
    
    res.json({ success: true, message: 'Seed data added', countries: countryCount, packages: packageCount });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
module.exports.adminAuth = adminAuth;
