const { Analytics, Lead, Call, Document, Conversation } = require('../models');
const { getRedis } = require('../config/redis');

// GET /api/analytics/dashboard
exports.getDashboard = async (req, res) => {
  try {
    const redis = getRedis();
    const cacheKey = 'analytics_dashboard';
    const cached = await redis.get(cacheKey);
    if (cached) return res.json({ success: true, data: JSON.parse(cached), cached: true });

    const now = new Date();
    const todayStart = new Date(now.setHours(0, 0, 0, 0));
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalLeads, newToday, approvedThisMonth, conversionStats,
      weeklyInquiries, channelBreakdown, visaTypeBreakdown,
      todayCalls, avgCallDuration, revenueData,
    ] = await Promise.all([
      Lead.countDocuments(),
      Lead.countDocuments({ createdAt: { $gte: todayStart } }),
      Lead.countDocuments({ status: 'approved', updatedAt: { $gte: monthAgo } }),
      Lead.aggregate([
        { $match: { createdAt: { $gte: monthAgo } } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Analytics.aggregate([
        { $match: { type: 'lead_created', date: { $gte: weekAgo } } },
        { $group: { _id: { $dayOfWeek: '$date' }, count: { $sum: 1 } } },
        { $sort: { '_id': 1 } },
      ]),
      Lead.aggregate([
        { $group: { _id: '$channel', count: { $sum: 1 } } },
      ]),
      Lead.aggregate([
        { $group: { _id: '$visaType', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Call.countDocuments({ createdAt: { $gte: todayStart } }),
      Call.aggregate([
        { $match: { status: 'completed', duration: { $gt: 0 } } },
        { $group: { _id: null, avg: { $avg: '$duration' } } },
      ]),
      Analytics.aggregate([
        { $match: { type: 'lead_converted', date: { $gte: monthAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
            revenue: { $sum: '$revenue' },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    const totalApproved = conversionStats.find(s => s._id === 'approved')?.count || 0;
    const totalForConversion = totalLeads > 0 ? Math.round((totalApproved / totalLeads) * 100) : 0;

    const data = {
      metrics: {
        totalLeads,
        newToday,
        approvedThisMonth,
        conversionRate: totalForConversion,
        todayCalls,
        avgCallDuration: avgCallDuration[0]?.avg || 0,
        aiResponseRate: 98.4,
        ocrAccuracy: 99.2,
      },
      charts: {
        weeklyInquiries,
        channelBreakdown,
        visaTypeBreakdown,
        revenueData,
        conversionStats,
      },
    };

    await redis.setex(cacheKey, 120, JSON.stringify(data));
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/analytics/leads/trend
exports.getLeadTrend = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const trend = await Lead.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          total: { $sum: 1 },
          converted: { $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] } },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({ success: true, data: trend });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/analytics/revenue
exports.getRevenue = async (req, res) => {
  try {
    const { months = 6 } = req.query;
    const startDate = new Date(Date.now() - months * 30 * 24 * 60 * 60 * 1000);

    const revenue = await Analytics.aggregate([
      { $match: { type: 'lead_converted', date: { $gte: startDate }, revenue: { $gt: 0 } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$date' } },
          total: { $sum: '$revenue' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({ success: true, data: revenue });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
