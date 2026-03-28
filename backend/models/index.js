// ============================================================
// models/index.js — All Mongoose Models
// ============================================================
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// ==================== USER ====================
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['admin', 'agent', 'viewer'], default: 'agent' },
  company: { type: String, default: 'SinghJi Tech' },
  phone: String,
  avatar: String,
  isActive: { type: Boolean, default: true },
  lastLogin: Date,
  refreshToken: String,
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshToken;
  return obj;
};

// ==================== LEAD ====================
const leadSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  phone: { type: String, required: true },
  email: String,
  visaType: {
    type: String,
    enum: ['student', 'work', 'tourist', 'business', 'pr', 'family', 'other'],
    default: 'other',
  },
  destination: String,
  status: {
    type: String,
    enum: ['new', 'contacted', 'processing', 'documents_submitted', 'approved', 'rejected', 'dormant'],
    default: 'new',
  },
  channel: { type: String, enum: ['whatsapp', 'voice', 'direct', 'referral', 'web'], default: 'whatsapp' },
  priority: { type: String, enum: ['low', 'medium', 'high', 'hot'], default: 'medium' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  tags: [String],
  notes: String,
  budget: Number,
  travelDate: Date,
  documents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Document' }],
  conversations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Conversation' }],
  crmId: String, // External CRM reference
  crmSynced: { type: Boolean, default: false },
  aiScore: { type: Number, min: 0, max: 100 }, // AI lead score
  aiSummary: String,
  lastContactedAt: Date,
  metadata: mongoose.Schema.Types.Mixed,
}, { timestamps: true });

leadSchema.index({ phone: 1 });
leadSchema.index({ status: 1 });
leadSchema.index({ createdAt: -1 });
leadSchema.index({ visaType: 1 });

// ==================== CONVERSATION ====================
const messageSchema = new mongoose.Schema({
  role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  language: { type: String, default: 'en' },
  metadata: mongoose.Schema.Types.Mixed,
});

const conversationSchema = new mongoose.Schema({
  lead: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },
  channel: { type: String, enum: ['whatsapp', 'voice', 'web', 'internal'] },
  messages: [messageSchema],
  status: { type: String, enum: ['active', 'resolved', 'escalated'], default: 'active' },
  assignedAgent: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  aiHandled: { type: Boolean, default: true },
  phoneNumber: String,
  whatsappId: String,
  summary: String,
  sentiment: { type: String, enum: ['positive', 'neutral', 'negative'] },
}, { timestamps: true });

// ==================== DOCUMENT ====================
const documentSchema = new mongoose.Schema({
  lead: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },
  originalName: String,
  type: { type: String, enum: ['passport', 'visa', 'bank_statement', 'offer_letter', 'degree', 'photo', 'other'] },
  url: String, // S3 URL
  s3Key: String,
  mimeType: String,
  size: Number,
  ocrProcessed: { type: Boolean, default: false },
  ocrData: {
    fullName: String,
    dateOfBirth: String,
    documentNumber: String,
    issueDate: String,
    expiryDate: String,
    nationality: String,
    gender: String,
    placeOfIssue: String,
    rawText: String,
    confidence: Number,
  },
  validationStatus: { type: String, enum: ['pending', 'valid', 'expired', 'invalid'], default: 'pending' },
  alerts: [String],
  processedAt: Date,
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// ==================== CALL LOG ====================
const callSchema = new mongoose.Schema({
  lead: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },
  type: { type: String, enum: ['inbound', 'outbound'] },
  status: { type: String, enum: ['initiated', 'ringing', 'in-progress', 'completed', 'failed', 'no-answer', 'busy'] },
  duration: Number, // seconds
  recordingUrl: String,
  transcript: String,
  twilioCallSid: String,
  fromNumber: String,
  toNumber: String,
  aiHandled: { type: Boolean, default: true },
  transferredToAgent: { type: Boolean, default: false },
  notes: String,
  sentiment: String,
  startedAt: Date,
  endedAt: Date,
}, { timestamps: true });

// ==================== KNOWLEDGE BASE ====================
const knowledgeSchema = new mongoose.Schema({
  country: { type: String, required: true },
  visaType: String,
  title: String,
  content: { type: String, required: true },
  category: { type: String, enum: ['requirement', 'faq', 'process', 'fee', 'timeline'] },
  tags: [String],
  language: { type: String, default: 'en' },
  isActive: { type: Boolean, default: true },
  views: { type: Number, default: 0 },
  embedding: [Number], // Vector embedding for semantic search
}, { timestamps: true });

// ==================== SETTINGS ====================
const settingsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true },
  company: {
    name: { type: String, default: 'SinghJi Tech Consultancy' },
    email: String,
    phone: String,
    address: String,
    logo: String,
  },
  whatsapp: {
    enabled: { type: Boolean, default: true },
    phoneId: String,
    token: String,
    defaultLanguage: { type: String, default: 'auto' },
    businessHours: {
      enabled: Boolean,
      start: { type: String, default: '09:00' },
      end: { type: String, default: '18:00' },
    },
  },
  voice: {
    enabled: { type: Boolean, default: true },
    inboundEnabled: { type: Boolean, default: true },
    outboundEnabled: { type: Boolean, default: false },
    botName: { type: String, default: 'Priya' },
    twilioNumber: String,
  },
  ocr: {
    enabled: { type: Boolean, default: true },
    autoProcess: { type: Boolean, default: true },
    provider: { type: String, default: 'google_vision' },
  },
  crm: {
    provider: { type: String, enum: ['zoho', 'salesforce', 'hubspot', 'custom', 'none'], default: 'none' },
    syncEnabled: { type: Boolean, default: false },
    apiEndpoint: String,
  },
  ai: {
    model: { type: String, default: 'gpt-4-turbo-preview' },
    hindiEnabled: { type: Boolean, default: true },
    autoScore: { type: Boolean, default: true },
  },
  notifications: {
    newLead: { type: Boolean, default: true },
    documentReceived: { type: Boolean, default: true },
    callCompleted: { type: Boolean, default: true },
    email: { type: Boolean, default: true },
  },
}, { timestamps: true });

// ==================== ANALYTICS EVENT ====================
const analyticsSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['lead_created', 'lead_converted', 'message_sent', 'message_received',
           'call_made', 'call_received', 'document_processed', 'visa_approved', 'visa_rejected'],
  },
  leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  channel: String,
  visaType: String,
  country: String,
  revenue: Number,
  metadata: mongoose.Schema.Types.Mixed,
  date: { type: Date, default: Date.now },
}, { timestamps: true });

analyticsSchema.index({ date: -1 });
analyticsSchema.index({ type: 1 });

// ==================== EXPORTS ====================
module.exports = {
  User: mongoose.model('User', userSchema),
  Lead: mongoose.model('Lead', leadSchema),
  Conversation: mongoose.model('Conversation', conversationSchema),
  Document: mongoose.model('Document', documentSchema),
  Call: mongoose.model('Call', callSchema),
  Knowledge: mongoose.model('Knowledge', knowledgeSchema),
  Settings: mongoose.model('Settings', settingsSchema),
  Analytics: mongoose.model('Analytics', analyticsSchema),
};
