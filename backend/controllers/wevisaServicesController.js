// backend/controllers/wevisaServicesController.js — Dynamic, DB-driven
const { USAAppointment, SchengenAppointment, DummyTicket, VisaApplication } = require('../models/wevisa');
const { WeVisaPackage } = require('../models/wevisaAdmin');

// ============= VISA APPLICATIONS =============
exports.getApplications = async (req, res) => {
  try {
    const apps = await VisaApplication.find({ agent: req.agent._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: apps });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.createApplication = async (req, res) => {
  try {
    const app = await VisaApplication.create({
      ...req.body,
      agent: req.agent._id,
      agentCommission: Math.floor((req.body.price || 0) * 0.1),
      trackingId: 'WV' + Date.now().toString().slice(-8),
    });
    res.status(201).json({ success: true, data: app });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// ============= VISA PACKAGES — Dynamic from admin DB =============
exports.getPackages = async (req, res) => {
  try {
    const { country, isExpress, category } = req.query;
    const q = { isActive: true };
    if (country)   q.countryName = { $regex: country, $options: 'i' };
    if (isExpress === 'true') q.isExpress = true;
    if (category)  q.category = category;

    const packages = await WeVisaPackage.find(q).sort({ isExpress: -1, sortOrder: 1, price: 1 });

    // Fallback to hardcoded defaults only if DB is totally empty
    if (!packages.length) {
      return res.json({ success: true, data: FALLBACK_PACKAGES.filter(p => {
        if (country && !p.countryName.toLowerCase().includes(country.toLowerCase())) return false;
        if (isExpress === 'true' && !p.isExpress) return false;
        if (category && p.category !== category) return false;
        return true;
      })});
    }
    res.json({ success: true, data: packages });
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
    // Use price sent from frontend (which reads from /public/usa-pricing)
    const defaultPrices = { pan_india: 35000, state_specific: 25000, city_specific: 20000 };
    const appt = await USAAppointment.create({
      ...req.body,
      agent: req.agent._id,
      price: req.body.price || defaultPrices[req.body.locationType] || 20000,
      trackingId: 'USA' + Date.now().toString().slice(-8),
    });
    res.status(201).json({ success: true, data: appt });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.updateUSAAppointment = async (req, res) => {
  try {
    const appt = await USAAppointment.findOneAndUpdate({ _id: req.params.id, agent: req.agent._id }, req.body, { new: true });
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
    // Lookup price from WeVisaPackage if available
    let price = req.body.price;
    if (!price) {
      const pkg = await WeVisaPackage.findOne({ countryName: { $regex: req.body.country, $options: 'i' }, category: 'appointment', isActive: true });
      price = pkg?.price || 8000;
    }
    const appt = await SchengenAppointment.create({
      ...req.body, price,
      agent: req.agent._id,
      trackingId: 'SCH' + Date.now().toString().slice(-8),
    });
    res.status(201).json({ success: true, data: appt });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// ============= DUMMY TICKETS =============
exports.getDummyTickets = async (req, res) => {
  try {
    const tickets = await DummyTicket.find({ agent: req.agent._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: tickets });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const AIRLINES = ['Air India','IndiGo','SpiceJet','Emirates','Lufthansa','British Airways','Singapore Airlines','Qatar Airways','Air Arabia','Flydubai'];
const randPNR  = () => Array.from({length:6}, () => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[Math.floor(Math.random()*36)]).join('');

exports.generateDummyTicket = async (req, res) => {
  try {
    const airline    = req.body.airline || AIRLINES[Math.floor(Math.random() * AIRLINES.length)];
    const flightNum  = airline.split(' ').map(w => w[0]).join('') + Math.floor(Math.random() * 9000 + 1000);
    const validUntil = new Date(); validUntil.setDate(validUntil.getDate() + 30);

    const ticket = await DummyTicket.create({
      ...req.body,
      agent: req.agent._id,
      airline,
      flightNumber: flightNum,
      pnrNumber:   randPNR(),
      price:       Number(process.env.DUMMY_TICKET_PRICE || 299),
      validUntil,
      status: 'generated',
    });
    res.status(201).json({ success: true, data: ticket });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// ── Fallback static packages (only used when DB is empty) ─────
const FALLBACK_PACKAGES = [
  { _id:'fb1', countryName:'United Arab Emirates', countryFlag:'🇦🇪', visaType:'Tourist', processingTime:'4 Hours',   stayDuration:'30 Days',  price:2499,  isExpress:true,  category:'evisa',       name:'Dubai Tourist eVisa' },
  { _id:'fb2', countryName:'Singapore',            countryFlag:'🇸🇬', visaType:'Tourist', processingTime:'24 Hours',  stayDuration:'30 Days',  price:3999,  isExpress:true,  category:'evisa',       name:'Singapore Tourist eVisa' },
  { _id:'fb3', countryName:'Vietnam',              countryFlag:'🇻🇳', visaType:'Tourist', processingTime:'2 Hours',   stayDuration:'30 Days',  price:1499,  isExpress:true,  category:'evisa',       name:'Vietnam Tourist eVisa' },
  { _id:'fb4', countryName:'Bali (Indonesia)',     countryFlag:'🇮🇩', visaType:'Tourist', processingTime:'24 Hours',  stayDuration:'30 Days',  price:2999,  isExpress:true,  category:'evisa',       name:'Bali Tourist eVisa' },
  { _id:'fb5', countryName:'Turkey',               countryFlag:'🇹🇷', visaType:'Tourist', processingTime:'24 Hours',  stayDuration:'90 Days',  price:3499,  isExpress:true,  category:'evisa',       name:'Turkey Tourist eVisa' },
  { _id:'fb6', countryName:'Thailand',             countryFlag:'🇹🇭', visaType:'Tourist', processingTime:'3-5 Days',  stayDuration:'30 Days',  price:2999,  isExpress:false, category:'evisa',       name:'Thailand Tourist eVisa' },
  { _id:'fb7', countryName:'Malaysia',             countryFlag:'🇲🇾', visaType:'Tourist', processingTime:'3-5 Days',  stayDuration:'30 Days',  price:1999,  isExpress:false, category:'evisa',       name:'Malaysia eVisa' },
  { _id:'fb8', countryName:'Canada',               countryFlag:'🇨🇦', visaType:'Tourist', processingTime:'4-6 Weeks', stayDuration:'6 Months', price:12000, isExpress:false, category:'sticker',     name:'Canada Tourist Visa' },
  { _id:'fb9', countryName:'United Kingdom',       countryFlag:'🇬🇧', visaType:'Tourist', processingTime:'3 Weeks',   stayDuration:'6 Months', price:15000, isExpress:false, category:'sticker',     name:'UK Tourist Visa' },
  { _id:'fb10',countryName:'Germany',              countryFlag:'🇩🇪', visaType:'Schengen', processingTime:'15 Days',   stayDuration:'90 Days',  price:8000,  isExpress:false, category:'appointment', name:'Germany Schengen Visa' },
  { _id:'fb11',countryName:'France',               countryFlag:'🇫🇷', visaType:'Schengen', processingTime:'15 Days',   stayDuration:'90 Days',  price:8500,  isExpress:false, category:'appointment', name:'France Schengen Visa' },
  { _id:'fb12',countryName:'Australia',            countryFlag:'🇦🇺', visaType:'Tourist', processingTime:'4-6 Weeks', stayDuration:'3 Months', price:18000, isExpress:false, category:'sticker',     name:'Australia Tourist Visa' },
];
