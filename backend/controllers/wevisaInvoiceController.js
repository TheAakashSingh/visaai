// backend/controllers/wevisaInvoiceController.js
const { WeVisaInvoice } = require('../models/wevisa');

const genInvoiceNumber = async (agentId) => {
  const count = await WeVisaInvoice.countDocuments({ agent: agentId });
  return `WV-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
};

// GET /api/wevisa/invoices
exports.getInvoices = async (req, res) => {
  try {
    const { status, type, search } = req.query;
    const query = { agent: req.agent._id };
    if (status) query.status = status;
    if (type) query.type = type;
    if (search) query.$or = [
      { invoiceNumber: { $regex: search, $options: 'i' } },
      { clientName: { $regex: search, $options: 'i' } },
    ];
    const invoices = await WeVisaInvoice.find(query).sort({ createdAt: -1 });
    res.json({ success: true, data: invoices });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// POST /api/wevisa/invoices
exports.createInvoice = async (req, res) => {
  try {
    const invoiceNumber = await genInvoiceNumber(req.agent._id);
    const items = req.body.items || [];
    const subtotal = items.reduce((s, i) => s + (i.unitPrice * i.quantity * (1 - (i.discount || 0) / 100)), 0);
    const taxAmount = items.reduce((s, i) => s + (i.unitPrice * i.quantity * (1 - (i.discount || 0) / 100) * (i.tax || 18) / 100), 0);
    const totalAmount = subtotal + taxAmount;

    const invoice = await WeVisaInvoice.create({
      ...req.body,
      agent: req.agent._id,
      invoiceNumber,
      subtotal,
      taxAmount,
      totalAmount,
    });
    res.status(201).json({ success: true, data: invoice });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// PUT /api/wevisa/invoices/:id
exports.updateInvoice = async (req, res) => {
  try {
    const invoice = await WeVisaInvoice.findOneAndUpdate(
      { _id: req.params.id, agent: req.agent._id }, req.body, { new: true }
    );
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
    res.json({ success: true, data: invoice });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// DELETE /api/wevisa/invoices/:id
exports.deleteInvoice = async (req, res) => {
  try {
    await WeVisaInvoice.findOneAndDelete({ _id: req.params.id, agent: req.agent._id });
    res.json({ success: true, message: 'Invoice deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// GET /api/wevisa/invoices/stats
exports.getStats = async (req, res) => {
  try {
    const agentId = req.agent._id;
    const [all, paid, unpaid, overdue] = await Promise.all([
      WeVisaInvoice.countDocuments({ agent: agentId }),
      WeVisaInvoice.countDocuments({ agent: agentId, status: 'paid' }),
      WeVisaInvoice.countDocuments({ agent: agentId, status: 'unpaid' }),
      WeVisaInvoice.countDocuments({ agent: agentId, status: 'overdue' }),
    ]);
    const revenueAgg = await WeVisaInvoice.aggregate([
      { $match: { agent: agentId, status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    res.json({ success: true, data: { total: all, paid, unpaid, overdue, revenue: revenueAgg[0]?.total || 0 } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
