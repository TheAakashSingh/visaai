// backend/models/wevisaAdmin.js — Admin & Country/Visa Models
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// ==================== ADMIN USER ====================
const adminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['superadmin', 'admin', 'staff'], default: 'admin' },
  isActive: { type: Boolean, default: true },
  lastLogin: Date,
  refreshToken: String,
}, { timestamps: true });

adminSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});
adminSchema.methods.comparePassword = async function(p) { return bcrypt.compare(p, this.password); };
adminSchema.methods.toJSON = function() { const o = this.toObject(); delete o.password; delete o.refreshToken; return o; };

// ==================== DOCUMENT TYPE ====================
const documentTypeSchema = new mongoose.Schema({
  name: { type: String, required: true },   // e.g. "Passport Copy"
  key: { type: String, required: true },    // e.g. "passport"
  description: String,
  icon: String,
  isRequired: { type: Boolean, default: true },
  acceptedFormats: [String],               // ['pdf', 'jpg', 'png']
  maxSizeMB: { type: Number, default: 5 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// ==================== COUNTRY ====================
const countrySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  code: { type: String, required: true, uppercase: true }, // ISO code e.g. "AE"
  flag: { type: String, required: true },   // emoji e.g. "🇦🇪"
  region: { type: String, enum: ['Asia', 'Europe', 'Americas', 'Africa', 'Oceania', 'Middle East'], required: true },
  capital: String,
  currency: String,
  language: String,
  description: String,
  bannerImage: String,
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  isSchengen: { type: Boolean, default: false },
  sortOrder: { type: Number, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'WeVisaAdmin' },
}, { timestamps: true });

// ==================== VISA PACKAGE (rich) ====================
const visaPackageRichSchema = new mongoose.Schema({
  country: { type: mongoose.Schema.Types.ObjectId, ref: 'WeVisaCountry', required: true },
  countryName: String,  // denormalized for fast lookup
  countryFlag: String,
  countryCode: String,

  // Core info
  name: { type: String, required: true },          // "30 Days Tourist Visa"
  visaType: { type: String, required: true },      // "Tourist"
  category: { type: String, enum: ['evisa', 'sticker', 'on_arrival', 'appointment', 'free'], default: 'evisa' },
  stayDuration: { type: String, required: true },  // "30 Days"
  validity: { type: String, required: true },      // "60 Days from issue"
  entries: { type: String, enum: ['single', 'double', 'multiple'], default: 'single' },
  processingTime: { type: String, required: true }, // "4 Hours"
  processingTimeHours: Number,                     // numeric for sorting

  // Pricing
  price: { type: Number, required: true },         // agent selling price
  agentCost: { type: Number, default: 0 },         // our cost
  commission: { type: Number, default: 0 },        // calculated commission

  // Flags
  isExpress: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  isPopular: { type: Boolean, default: false },

  // Description & notes
  description: String,
  importantNotes: [String],
  inclusions: [String],
  exclusions: [String],

  // Document checklist — which docs required for this specific visa
  requiredDocuments: [{
    documentType: { type: mongoose.Schema.Types.ObjectId, ref: 'WeVisaDocumentType' },
    name: String,         // copy for speed
    key: String,
    isRequired: { type: Boolean, default: true },
    notes: String,        // e.g. "Last 3 months bank statement"
  }],

  // Stats
  totalApplications: { type: Number, default: 0 },
  approvedApplications: { type: Number, default: 0 },
  sortOrder: { type: Number, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'WeVisaAdmin' },
}, { timestamps: true });

// ==================== VISA APPLICATION (rich, linked to packages) ====================
const visaApplicationRichSchema = new mongoose.Schema({
  agent: { type: mongoose.Schema.Types.ObjectId, ref: 'WeVisaAgent', required: true },
  agentName: String,
  agentAgency: String,

  // Package reference
  package: { type: mongoose.Schema.Types.ObjectId, ref: 'WeVisaPackage' },
  country: { type: mongoose.Schema.Types.ObjectId, ref: 'WeVisaCountry' },
  countryName: { type: String, required: true },
  countryFlag: String,
  visaType: { type: String, required: true },
  packageName: String,
  processingTime: String,
  stayDuration: String,
  validity: String,
  entries: String,

  // Pricing
  price: { type: Number, required: true },
  agentCost: { type: Number, default: 0 },
  commission: { type: Number, default: 0 },

  // Applicant
  applicantName: { type: String, required: true },
  applicantEmail: String,
  applicantPhone: String,
  passportNumber: String,
  passportExpiry: Date,
  dateOfBirth: Date,
  nationality: String,
  travelDate: Date,
  returnDate: Date,
  numberOfApplicants: { type: Number, default: 1 },

  // Uploaded documents
  documents: [{
    documentKey: String,
    documentName: String,
    fileName: String,
    fileUrl: String,
    fileSize: Number,
    mimeType: String,
    uploadedAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    adminNote: String,
  }],

  // Status flow
  status: {
    type: String,
    enum: ['draft', 'submitted', 'documents_pending', 'under_review', 'processing', 'approved', 'rejected', 'cancelled'],
    default: 'submitted'
  },
  statusHistory: [{
    status: String,
    updatedBy: String,
    note: String,
    timestamp: { type: Date, default: Date.now },
  }],

  // Admin
  assignedTo: String,
  adminNotes: String,
  rejectionReason: String,
  approvalDate: Date,

  // Payment
  paymentStatus: { type: String, enum: ['pending', 'paid', 'refunded'], default: 'pending' },
  paymentId: String,
  paidAt: Date,

  // Tracking
  trackingId: { type: String, unique: true },
  notes: String,
}, { timestamps: true });

// Auto-generate trackingId
visaApplicationRichSchema.pre('save', function(next) {
  if (!this.trackingId) {
    this.trackingId = 'WV' + Date.now().toString().slice(-8) + Math.random().toString(36).slice(-3).toUpperCase();
  }
  next();
});

module.exports = {
  WeVisaAdmin: mongoose.model('WeVisaAdmin', adminSchema),
  WeVisaDocumentType: mongoose.model('WeVisaDocumentType', documentTypeSchema),
  WeVisaCountry: mongoose.model('WeVisaCountry', countrySchema),
  WeVisaPackage: mongoose.model('WeVisaPackage', visaPackageRichSchema),
  WeVisaApplicationRich: mongoose.model('WeVisaApplicationRich', visaApplicationRichSchema),
};
