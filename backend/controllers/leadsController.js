const { Lead, Analytics, Conversation } = require('../models');
const { getRedis } = require('../config/redis');
const aiService = require('../services/aiService');
const crmService = require('../services/crmService');
const logger = require('../utils/logger');

// GET /api/leads
exports.getLeads = async (req, res) => {
  try {
    const {
      page = 1, limit = 20, status, visaType, channel,
      priority, search, sortBy = 'createdAt', sortOrder = 'desc',
    } = req.query;

    const query = {};
    if (status) query.status = status;
    if (visaType) query.visaType = visaType;
    if (channel) query.channel = channel;
    if (priority) query.priority = priority;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { destination: { $regex: search, $options: 'i' } },
      ];
    }

    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
    const skip = (page - 1) * limit;

    const [leads, total] = await Promise.all([
      Lead.find(query)
        .sort(sort)
        .skip(skip)
        .limit(Number(limit))
        .populate('assignedTo', 'name email')
        .lean(),
      Lead.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: leads,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
        limit: Number(limit),
      },
    });
  } catch (err) {
    logger.error('getLeads error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/leads/:id
exports.getLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('documents')
      .populate('conversations');

    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });
    res.json({ success: true, data: lead });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/leads
exports.createLead = async (req, res) => {
  try {
    const leadData = req.body;

    // Check for duplicate phone
    const existing = await Lead.findOne({ phone: leadData.phone });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Lead with this phone number already exists',
        data: existing,
      });
    }

    const lead = await Lead.create(leadData);

    // AI score lead in background
    aiService.scoreLead(lead).then(async (score) => {
      await Lead.findByIdAndUpdate(lead._id, { aiScore: score.score, aiSummary: score.summary });
    }).catch(logger.error);

    // CRM sync in background
    crmService.createLead(lead).catch(logger.error);

    // Track analytics
    await Analytics.create({ type: 'lead_created', leadId: lead._id, channel: lead.channel, visaType: lead.visaType });

    // Emit to Socket.IO
    req.app.get('io')?.emit('lead:new', lead);

    logger.info(`Lead created: ${lead.name} (${lead.phone})`);
    res.status(201).json({ success: true, data: lead });
  } catch (err) {
    logger.error('createLead error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/leads/:id
exports.updateLead = async (req, res) => {
  try {
    const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    }).populate('assignedTo', 'name email');

    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });

    // If status changed to approved, track analytics
    if (req.body.status === 'approved') {
      await Analytics.create({ type: 'lead_converted', leadId: lead._id, visaType: lead.visaType, revenue: req.body.revenue });
    }

    req.app.get('io')?.emit('lead:updated', lead);
    res.json({ success: true, data: lead });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/leads/:id
exports.deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });
    req.app.get('io')?.emit('lead:deleted', { id: req.params.id });
    res.json({ success: true, message: 'Lead deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/leads/:id/score
exports.scoreLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });

    const score = await aiService.scoreLead(lead);
    await Lead.findByIdAndUpdate(lead._id, { aiScore: score.score, aiSummary: score.summary });

    res.json({ success: true, data: score });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/leads/stats/summary
exports.getStats = async (req, res) => {
  try {
    const redis = getRedis();
    const cached = await redis.get('lead_stats');
    if (cached) return res.json({ success: true, data: JSON.parse(cached) });

    const [total, byStatus, byVisa, hotLeads, newToday] = await Promise.all([
      Lead.countDocuments(),
      Lead.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Lead.aggregate([{ $group: { _id: '$visaType', count: { $sum: 1 } } }]),
      Lead.countDocuments({ priority: 'hot' }),
      Lead.countDocuments({ createdAt: { $gte: new Date(new Date().setHours(0,0,0,0)) } }),
    ]);

    const stats = { total, byStatus, byVisa, hotLeads, newToday };
    await redis.setex('lead_stats', 60, JSON.stringify(stats)); // Cache 60s

    res.json({ success: true, data: stats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
