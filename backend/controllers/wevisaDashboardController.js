// backend/controllers/wevisaDashboardController.js
const { WeVisaAgent, VisaApplication, DummyTicket, USAAppointment, SchengenAppointment, WeVisaInvoice, WeVisaCRMLead } = require('../models/wevisa');

// GET /api/wevisa/dashboard/stats
exports.getStats = async (req, res) => {
  try {
    const agentId = req.agent._id;
    const [invoices, dummyTickets, usaAppts, schengenAppts, visaApps, leads] = await Promise.all([
      WeVisaInvoice.countDocuments({ agent: agentId }),
      DummyTicket.countDocuments({ agent: agentId }),
      USAAppointment.countDocuments({ agent: agentId }),
      SchengenAppointment.countDocuments({ agent: agentId }),
      VisaApplication.countDocuments({ agent: agentId }),
      WeVisaCRMLead.countDocuments({ agent: agentId }),
    ]);

    // Total earnings
    const earningsAgg = await WeVisaInvoice.aggregate([
      { $match: { agent: agentId, status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalEarnings = earningsAgg[0]?.total || 0;

    res.json({
      success: true,
      data: {
        invoicesGenerated: invoices,
        dummyTickets,
        usaAppointments: usaAppts,
        schengenAppointments: schengenAppts,
        visaApplications: visaApps,
        crmLeads: leads,
        totalEarnings,
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
