// backend/controllers/wevisaCRMController.js
const { WeVisaCRMLead, WeVisaTask } = require('../models/wevisa');

// GET /api/wevisa/crm/leads
exports.getLeads = async (req, res) => {
  try {
    const { status, priority, search, page = 1, limit = 50 } = req.query;
    const query = { agent: req.agent._id };
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (search) query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
    ];
    const leads = await WeVisaCRMLead.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit));
    const total = await WeVisaCRMLead.countDocuments(query);
    res.json({ success: true, data: leads, total, page: Number(page) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/wevisa/crm/leads
exports.createLead = async (req, res) => {
  try {
    const lead = await WeVisaCRMLead.create({ ...req.body, agent: req.agent._id });
    res.status(201).json({ success: true, data: lead });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/wevisa/crm/leads/:id
exports.updateLead = async (req, res) => {
  try {
    const lead = await WeVisaCRMLead.findOneAndUpdate(
      { _id: req.params.id, agent: req.agent._id },
      req.body, { new: true }
    );
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });
    res.json({ success: true, data: lead });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/wevisa/crm/leads/:id
exports.deleteLead = async (req, res) => {
  try {
    await WeVisaCRMLead.findOneAndDelete({ _id: req.params.id, agent: req.agent._id });
    res.json({ success: true, message: 'Lead deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/wevisa/crm/stats
exports.getStats = async (req, res) => {
  try {
    const agentId = req.agent._id;
    const [total, newLeads, contacted, documents, payment, applied, completed] = await Promise.all([
      WeVisaCRMLead.countDocuments({ agent: agentId }),
      WeVisaCRMLead.countDocuments({ agent: agentId, status: 'new' }),
      WeVisaCRMLead.countDocuments({ agent: agentId, status: 'contacted' }),
      WeVisaCRMLead.countDocuments({ agent: agentId, status: 'documents' }),
      WeVisaCRMLead.countDocuments({ agent: agentId, status: 'payment' }),
      WeVisaCRMLead.countDocuments({ agent: agentId, status: 'applied' }),
      WeVisaCRMLead.countDocuments({ agent: agentId, status: 'completed' }),
    ]);
    res.json({ success: true, data: { total, newLeads, contacted, documents, payment, applied, completed } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/wevisa/crm/tasks
exports.getTasks = async (req, res) => {
  try {
    const tasks = await WeVisaTask.find({ agent: req.agent._id }).populate('lead', 'name').sort({ dueDate: 1 });
    res.json({ success: true, data: tasks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/wevisa/crm/tasks
exports.createTask = async (req, res) => {
  try {
    const task = await WeVisaTask.create({ ...req.body, agent: req.agent._id });
    res.status(201).json({ success: true, data: task });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/wevisa/crm/tasks/:id
exports.updateTask = async (req, res) => {
  try {
    const task = await WeVisaTask.findOneAndUpdate(
      { _id: req.params.id, agent: req.agent._id },
      req.body, { new: true }
    );
    res.json({ success: true, data: task });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
