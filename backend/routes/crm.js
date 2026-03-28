// routes/crm.js
const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const crmService = require('../services/crmService');
const { Lead, Conversation } = require('../models');
const logger = require('../utils/logger');

router.use(auth);

// POST /api/crm/sync/:leadId — sync single lead
router.post('/sync/:leadId', async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.leadId);
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });
    const crmId = lead.crmId
      ? await crmService.updateLead(lead)
      : await crmService.createLead(lead);
    res.json({ success: true, data: { crmId, synced: true } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/crm/sync-all — bulk sync unsynced leads
router.post('/sync-all', async (req, res) => {
  try {
    const unsynced = await Lead.find({ crmSynced: { $ne: true } }).limit(100);
    const results = await Promise.allSettled(unsynced.map(l => crmService.createLead(l)));
    const synced = results.filter(r => r.status === 'fulfilled' && r.value).length;
    res.json({ success: true, data: { synced, total: unsynced.length, failed: unsynced.length - synced } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/crm/test — test CRM connection
router.post('/test', async (req, res) => {
  try {
    const { provider } = req.body;
    const result = await crmService.testConnection(provider || 'zoho');
    res.json({ success: result.success, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/crm/interaction-history/:leadId — full transcript for CRM
router.get('/interaction-history/:leadId', async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.leadId).lean();
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });

    const conversations = await Conversation.find({ lead: req.params.leadId })
      .sort({ updatedAt: -1 })
      .lean();

    const history = conversations.map(conv => ({
      channel: conv.channel,
      status: conv.status,
      messages: conv.messages || [],
      messageCount: conv.messages?.length || 0,
      startedAt: conv.createdAt,
      lastActivity: conv.updatedAt,
    }));

    res.json({ success: true, data: { lead, history, totalInteractions: history.length } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/crm/tag/:leadId — apply intelligent tags
router.post('/tag/:leadId', async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.leadId);
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });
    const tags = await crmService.applyIntelligentTags(lead);
    res.json({ success: true, data: { tags } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/crm/dormant — find dormant leads
router.get('/dormant', async (req, res) => {
  try {
    const result = await crmService.findAndReengageDormantLeads();
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/crm/stats — CRM sync stats
router.get('/stats', async (req, res) => {
  try {
    const [total, synced, unsynced, dormant, tagged] = await Promise.all([
      Lead.countDocuments(),
      Lead.countDocuments({ crmSynced: true }),
      Lead.countDocuments({ crmSynced: { $ne: true } }),
      Lead.countDocuments({ tags: 'dormant' }),
      Lead.countDocuments({ tags: { $exists: true, $not: { $size: 0 } } }),
    ]);
    res.json({ success: true, data: { total, synced, unsynced, dormant, tagged, syncRate: total > 0 ? Math.round((synced / total) * 100) : 0 } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;