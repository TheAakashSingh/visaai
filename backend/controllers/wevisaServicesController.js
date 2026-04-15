// backend/controllers/wevisaServicesController.js
const { USAAppointment, SchengenAppointment, DummyTicket, VisaApplication, VisaPackage } = require('../models/wevisa');
const { v4: uuidv4 } = require('uuid');

// ============= VISA APPLICATIONS =============
exports.getApplications = async (req, res) => {
  try {
    const apps = await VisaApplication.find({ agent: req.agent._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: apps });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.createApplication = async (req, res) => {
  try {
    const commission = Math.floor(req.body.price * 0.1);
    const app = await VisaApplication.create({
      ...req.body,
      agent: req.agent._id,
      agentCommission: commission,
      trackingId: 'WV' + Date.now().toString().slice(-8),
    });
    res.status(201).json({ success: true, data: app });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// ============= USA APPOINTMENTS =============
exports.getUSAAppointments = async (req, res) => {
  try {
    const appts = await USAAppointment.find({ agent: req.agent._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: appts });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.createUSAAppointment = async (req, res) => {
  try {
    const prices = { pan_india: 35000, state_specific: 25000, city_specific: 20000 };
    const appt = await USAAppointment.create({
      ...req.body,
      agent: req.agent._id,
      price: req.body.price || prices[req.body.locationType] || 20000,
      trackingId: 'USA' + Date.now().toString().slice(-8),
    });
    res.status(201).json({ success: true, data: appt, message: 'USA Appointment submitted successfully!' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.updateUSAAppointment = async (req, res) => {
  try {
    const appt = await USAAppointment.findOneAndUpdate(
      { _id: req.params.id, agent: req.agent._id }, req.body, { new: true }
    );
    if (!appt) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: appt });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// ============= SCHENGEN APPOINTMENTS =============
exports.getSchengenAppointments = async (req, res) => {
  try {
    const appts = await SchengenAppointment.find({ agent: req.agent._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: appts });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.createSchengenAppointment = async (req, res) => {
  try {
    const appt = await SchengenAppointment.create({
      ...req.body,
      agent: req.agent._id,
      trackingId: 'SCH' + Date.now().toString().slice(-8),
    });
    res.status(201).json({ success: true, data: appt, message: 'Schengen appointment submitted!' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// ============= DUMMY TICKETS =============
exports.getDummyTickets = async (req, res) => {
  try {
    const tickets = await DummyTicket.find({ agent: req.agent._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: tickets });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const AIRLINES = ['Air India', 'IndiGo', 'SpiceJet', 'Emirates', 'Lufthansa', 'British Airways', 'Singapore Airlines', 'Qatar Airways'];
const randPNR = () => Array.from({ length: 6 }, () => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[Math.floor(Math.random() * 36)]).join('');

exports.generateDummyTicket = async (req, res) => {
  try {
    const airline = req.body.airline || AIRLINES[Math.floor(Math.random() * AIRLINES.length)];
    const flightNum = airline.split(' ').map(w => w[0]).join('') + Math.floor(Math.random() * 9000 + 1000);
    const validUntil = new Date(); validUntil.setDate(validUntil.getDate() + 30);

    const ticket = await DummyTicket.create({
      ...req.body,
      agent: req.agent._id,
      airline,
      flightNumber: flightNum,
      pnrNumber: randPNR(),
      price: 299,
      validUntil,
      status: 'generated',
    });
    res.status(201).json({ success: true, data: ticket, message: 'Dummy ticket generated!' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// ============= VISA PACKAGES =============
exports.getPackages = async (req, res) => {
  try {
    const { country } = req.query;
    const query = { isActive: true };
    if (country) query.country = { $regex: country, $options: 'i' };
    const packages = await VisaPackage.find(query).sort({ price: 1 });

    // Return defaults if DB empty
    if (!packages.length) {
      return res.json({ success: true, data: DEFAULT_PACKAGES.filter(p => !country || p.country.toLowerCase().includes(country.toLowerCase())) });
    }
    res.json({ success: true, data: packages });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const DEFAULT_PACKAGES = [
  { country: 'United Arab Emirates', flag: '🇦🇪', visaType: 'Tourist eVisa', processingTime: '4 Hours', stayDuration: '30 Days', price: 2499, isExpress: true, category: 'evisa' },
  { country: 'Singapore', flag: '🇸🇬', visaType: 'Tourist eVisa', processingTime: '24 Hours', stayDuration: '30 Days', price: 3999, isExpress: true, category: 'evisa' },
  { country: 'Vietnam', flag: '🇻🇳', visaType: 'Tourist eVisa', processingTime: '2 Hours', stayDuration: '30 Days', price: 1499, isExpress: true, category: 'evisa' },
  { country: 'Bali (Indonesia)', flag: '🇮🇩', visaType: 'Tourist eVisa', processingTime: '24 Hours', stayDuration: '30 Days', price: 2999, isExpress: true, category: 'evisa' },
  { country: 'Turkey', flag: '🇹🇷', visaType: 'Tourist eVisa', processingTime: '24 Hours', stayDuration: '90 Days', price: 3499, isExpress: true, category: 'evisa' },
  { country: 'Canada', flag: '🇨🇦', visaType: 'Tourist Visa', processingTime: '4-6 weeks', stayDuration: '6 months', price: 12000, isExpress: false, category: 'sticker' },
  { country: 'United Kingdom', flag: '🇬🇧', visaType: 'Tourist Visa', processingTime: '3 weeks', stayDuration: '6 months', price: 15000, isExpress: false, category: 'sticker' },
  { country: 'Germany', flag: '🇩🇪', visaType: 'Schengen Visa', processingTime: '15 days', stayDuration: '90 days', price: 8000, isExpress: false, category: 'appointment' },
];
