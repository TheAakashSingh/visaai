// backend/models/wevisa.js — WeVisa Platform Models
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// ==================== WEVISA AGENT ====================
const wevisaAgentSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  phone: { type: String, required: true },
  agencyName: { type: String, required: true },
  agencyType: { type: String, enum: ['individual', 'agency', 'franchise'], default: 'individual' },
  city: String,
  state: String,
  gstin: String,
  panNumber: String,
  bankDetails: {
    accountNumber: String,
    ifscCode: String,
    bankName: String,
    accountHolder: String,
  },
  status: { type: String, enum: ['pending', 'active', 'suspended'], default: 'active' },
  isVerified: { type: Boolean, default: false },
  tier: { type: String, enum: ['basic', 'silver', 'gold', 'platinum'], default: 'basic' },
  commissionRate: { type: Number, default: 500 },
  totalEarnings: { type: Number, default: 0 },
  totalVisasProcessed: { type: Number, default: 0 },
  lastLogin: Date,
  refreshToken: String,
  profilePhoto: String,
  notes: String,
}, { timestamps: true });

wevisaAgentSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});
wevisaAgentSchema.methods.comparePassword = async function(p) { return bcrypt.compare(p, this.password); };
wevisaAgentSchema.methods.toJSON = function() { const o = this.toObject(); delete o.password; delete o.refreshToken; return o; };

// ==================== VISA APPLICATION ====================
const visaApplicationSchema = new mongoose.Schema({
  agent: { type: mongoose.Schema.Types.ObjectId, ref: 'WeVisaAgent', required: true },
  applicantName: { type: String, required: true },
  applicantEmail: String,
  applicantPhone: String,
  country: { type: String, required: true },
  visaType: { type: String, required: true },
  packageId: String,
  packageName: String,
  processingTime: String,
  stayDuration: String,
  price: { type: Number, required: true },
  agentCommission: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['draft', 'submitted', 'processing', 'approved', 'rejected', 'cancelled'],
    default: 'submitted'
  },
  documents: [{
    name: String,
    url: String,
    type: String,
    uploadedAt: { type: Date, default: Date.now },
  }],
  passportNumber: String,
  passportExpiry: Date,
  travelDate: Date,
  returnDate: Date,
  notes: String,
  adminNotes: String,
  trackingId: String,
  paymentStatus: { type: String, enum: ['pending', 'paid', 'refunded'], default: 'pending' },
  paymentId: String,
}, { timestamps: true });

// ==================== DUMMY TICKET ====================
const dummyTicketSchema = new mongoose.Schema({
  agent: { type: mongoose.Schema.Types.ObjectId, ref: 'WeVisaAgent', required: true },
  applicantName: { type: String, required: true },
  passportNumber: String,
  fromCity: { type: String, required: true },
  toCity: { type: String, required: true },
  departureDate: { type: Date, required: true },
  returnDate: Date,
  airline: String,
  flightNumber: String,
  pnrNumber: String,
  class: { type: String, enum: ['economy', 'business', 'first'], default: 'economy' },
  price: { type: Number, default: 299 },
  status: { type: String, enum: ['generated', 'expired'], default: 'generated' },
  validUntil: Date,
  ticketUrl: String,
}, { timestamps: true });

// ==================== USA APPOINTMENT ====================
const usaAppointmentSchema = new mongoose.Schema({
  agent: { type: mongoose.Schema.Types.ObjectId, ref: 'WeVisaAgent', required: true },
  applicantName: { type: String, required: true },
  applicantEmail: String,
  applicantPhone: String,
  locationType: { type: String, enum: ['pan_india', 'state_specific', 'city_specific'], required: true },
  state: String,
  city: String,
  appointmentDate: Date,
  timeSlot: String,
  price: { type: Number, required: true },
  timeframe: String,
  passportFrontUrl: String,
  passportBackUrl: String,
  usVisaUsername: String,
  usVisaPassword: String,
  securityQuestions: [{
    question: String,
    answer: String,
  }],
  status: {
    type: String,
    enum: ['pending', 'processing', 'booked', 'completed', 'cancelled', 'refunded'],
    default: 'pending'
  },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'refunded'], default: 'pending' },
  notes: String,
  adminNotes: String,
  trackingId: String,
}, { timestamps: true });

// ==================== SCHENGEN APPOINTMENT ====================
const schengenAppointmentSchema = new mongoose.Schema({
  agent: { type: mongoose.Schema.Types.ObjectId, ref: 'WeVisaAgent', required: true },
  applicantName: { type: String, required: true },
  applicantEmail: String,
  applicantPhone: String,
  country: { type: String, required: true }, // France, Germany, etc.
  visaType: { type: String, enum: ['tourist', 'business', 'student', 'family'], default: 'tourist' },
  appointmentDate: Date,
  appointmentCenter: String,
  price: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'processing', 'booked', 'completed', 'cancelled'],
    default: 'pending'
  },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'refunded'], default: 'pending' },
  documents: [{ name: String, url: String }],
  trackingId: String,
}, { timestamps: true });

// ==================== INVOICE ====================
const invoiceSchema = new mongoose.Schema({
  agent: { type: mongoose.Schema.Types.ObjectId, ref: 'WeVisaAgent', required: true },
  invoiceNumber: { type: String, unique: true, required: true },
  type: {
    type: String,
    enum: ['invoice', 'tax_invoice', 'proforma', 'receipt', 'sales_receipt', 'cash_receipt', 'quote', 'estimate', 'credit_memo', 'credit_note', 'purchase_order', 'delivery_note', 'purchase'],
    default: 'invoice'
  },
  clientName: { type: String, required: true },
  clientEmail: String,
  clientPhone: String,
  clientAddress: String,
  clientGSTIN: String,
  items: [{
    description: { type: String, required: true },
    quantity: { type: Number, default: 1 },
    unitPrice: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    tax: { type: Number, default: 18 },
    total: Number,
  }],
  subtotal: { type: Number, default: 0 },
  discountAmount: { type: Number, default: 0 },
  taxAmount: { type: Number, default: 0 },
  totalAmount: { type: Number, default: 0 },
  currency: { type: String, default: 'INR' },
  status: { type: String, enum: ['draft', 'sent', 'paid', 'partially_paid', 'unpaid', 'overdue', 'refunded', 'archived'], default: 'unpaid' },
  dueDate: Date,
  issueDate: { type: Date, default: Date.now },
  paidAmount: { type: Number, default: 0 },
  paidDate: Date,
  paymentMethod: String,
  notes: String,
  terms: String,
  businessProfile: {
    name: String,
    address: String,
    gstin: String,
    phone: String,
    email: String,
  },
  isRecurring: { type: Boolean, default: false },
  recurringInterval: String,
  relatedApplication: { type: mongoose.Schema.Types.ObjectId, ref: 'VisaApplication' },
}, { timestamps: true });

// ==================== CRM LEAD (WeVisa specific) ====================
const wevisaCRMLeadSchema = new mongoose.Schema({
  agent: { type: mongoose.Schema.Types.ObjectId, ref: 'WeVisaAgent', required: true },
  name: { type: String, required: true },
  email: String,
  phone: String,
  company: String,
  source: { 
    type: String, 
    enum: ['website', 'referral', 'social', 'walk_in', 'phone_call', 'email_campaign', 'facebook_ads', 'google_ads', 'justdial', 'other'], 
    default: 'other' 
  },
  visaInterest: String,
  destination: String,
  travelDateGo: Date,
  travelDateReturn: Date,
  budget: Number,
  travelDate: Date,
  status: {
    type: String,
    enum: ['new', 'contacted', 'documents', 'payment', 'applied', 'completed'],
    default: 'new'
  },
  priority: { type: String, enum: ['low', 'medium', 'high', 'hot'], default: 'medium' },
  tags: [String],
  notes: String,
  lastContactedAt: Date,
  assignedTo: String,
  deals: [{ title: String, value: Number, status: String }],
}, { timestamps: true });

// ==================== CRM TASK ====================
const wevisaTaskSchema = new mongoose.Schema({
  agent: { type: mongoose.Schema.Types.ObjectId, ref: 'WeVisaAgent', required: true },
  title: { type: String, required: true },
  description: String,
  lead: { type: mongoose.Schema.Types.ObjectId, ref: 'WeVisaCRMLead' },
  dueDate: Date,
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
  completedAt: Date,
}, { timestamps: true });

// ==================== COUNTRY/VISA PACKAGE ====================
const visaPackageSchema = new mongoose.Schema({
  country: { type: String, required: true },
  countryCode: String,
  flag: String,
  visaType: { type: String, required: true },
  name: { type: String, required: true },
  processingTime: String,
  stayDuration: String,
  price: { type: Number, required: true },
  agentPrice: Number,
  commission: Number,
  description: String,
  requirements: [String],
  isExpress: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  category: { type: String, enum: ['evisa', 'sticker', 'on_arrival', 'appointment'], default: 'evisa' },
}, { timestamps: true });

module.exports = {
  WeVisaAgent: mongoose.model('WeVisaAgent', wevisaAgentSchema),
  VisaApplication: mongoose.model('VisaApplication', visaApplicationSchema),
  DummyTicket: mongoose.model('DummyTicket', dummyTicketSchema),
  USAAppointment: mongoose.model('USAAppointment', usaAppointmentSchema),
  SchengenAppointment: mongoose.model('SchengenAppointment', schengenAppointmentSchema),
  WeVisaInvoice: mongoose.model('WeVisaInvoice', invoiceSchema),
  WeVisaCRMLead: mongoose.model('WeVisaCRMLead', wevisaCRMLeadSchema),
  WeVisaTask: mongoose.model('WeVisaTask', wevisaTaskSchema),
  VisaPackage: mongoose.model('VisaPackage', visaPackageSchema),
};
