const axios = require('axios');
const { Lead, Conversation, Analytics } = require('../models');
const aiService = require('../services/aiService');
const logger = require('../utils/logger');

const WHATSAPP_API = `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_ID}/messages`;

// Send WhatsApp message
const sendWhatsAppMessage = async (to, message) => {
  try {
    const response = await axios.post(WHATSAPP_API, {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'text',
      text: { preview_url: false, body: message },
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (err) {
    logger.error('WhatsApp send error:', err.response?.data || err.message);
    throw err;
  }
};

// POST /api/chatbot/send
exports.sendMessage = async (req, res) => {
  try {
    const { phone, message, leadId } = req.body;

    const result = await sendWhatsAppMessage(phone, message);

    // Save to conversation
    if (leadId) {
      await Conversation.findOneAndUpdate(
        { lead: leadId, channel: 'whatsapp' },
        {
          $push: {
            messages: { role: 'assistant', content: message, timestamp: new Date() },
          },
          $setOnInsert: { lead: leadId, channel: 'whatsapp' },
        },
        { upsert: true, new: true }
      );
    }

    await Analytics.create({ type: 'message_sent', leadId, channel: 'whatsapp' });

    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/chatbot/chat — AI chat (internal/web)
exports.chat = async (req, res) => {
  try {
    const { message, leadId, sessionId, language } = req.body;

    // Get or create conversation
    let conversation = await Conversation.findOne({
      $or: [
        { lead: leadId },
        { 'messages.0': { $exists: true }, channel: 'web' },
      ],
      status: 'active',
    });

    const history = conversation?.messages?.slice(-10) || [];

    // Get AI response
    const aiResponse = await aiService.chat(message, history, language || 'auto');

    // Save messages
    const newMessages = [
      { role: 'user', content: message, timestamp: new Date() },
      { role: 'assistant', content: aiResponse.content, timestamp: new Date() },
    ];

    if (conversation) {
      conversation.messages.push(...newMessages);
      await conversation.save();
    } else {
      conversation = await Conversation.create({
        lead: leadId || null,
        channel: 'web',
        messages: newMessages,
        status: 'active',
      });
    }

    await Analytics.create({ type: 'message_received', leadId, channel: 'web' });

    res.json({
      success: true,
      data: {
        message: aiResponse.content,
        language: aiResponse.language,
        leadInfo: aiResponse.leadInfo,
        conversationId: conversation._id,
      },
    });
  } catch (err) {
    logger.error('Chat error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/chatbot/conversations
exports.getConversations = async (req, res) => {
  try {
    const { page = 1, limit = 20, channel } = req.query;
    const query = channel ? { channel } : {};

    const conversations = await Conversation.find(query)
      .populate('lead', 'name phone visaType status')
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, data: conversations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/chatbot/stats
exports.getStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalConversations, activeConversations, resolvedToday] = await Promise.all([
      Conversation.countDocuments(),
      Conversation.countDocuments({ status: 'active' }),
      Conversation.countDocuments({ status: 'resolved', updatedAt: { $gte: today } }),
    ]);

    res.json({
      success: true,
      data: {
        totalConversations,
        activeConversations,
        resolvedToday,
        avgResponseTime: '<2s',
        resolutionRate: '94%',
        languagesSupported: ['en', 'hi'],
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Webhook handler (called from webhooks route)
exports.handleWebhook = async (phoneNumber, messageBody, whatsappMsgId) => {
  try {
    logger.info(`WhatsApp message from ${phoneNumber}: ${messageBody.substring(0, 50)}`);

    // Find or create lead
    let lead = await Lead.findOne({ phone: phoneNumber });
    if (!lead) {
      lead = await Lead.create({
        name: 'WhatsApp User',
        phone: phoneNumber,
        channel: 'whatsapp',
        status: 'new',
      });
      logger.info(`New lead created from WhatsApp: ${phoneNumber}`);
    }

    // Get conversation history
    let conversation = await Conversation.findOne({ lead: lead._id, channel: 'whatsapp', status: 'active' });
    const history = conversation?.messages?.slice(-8) || [];

    // Save incoming message
    const userMsg = { role: 'user', content: messageBody, timestamp: new Date(), metadata: { whatsappId: whatsappMsgId } };
    if (conversation) {
      conversation.messages.push(userMsg);
    } else {
      conversation = new Conversation({ lead: lead._id, channel: 'whatsapp', messages: [userMsg], status: 'active' });
    }

    // Get AI reply
    const aiResponse = await aiService.chatWithLeadContext(messageBody, history, lead);
    const botMsg = { role: 'assistant', content: aiResponse.content, timestamp: new Date() };
    conversation.messages.push(botMsg);
    await conversation.save();

    // Send WhatsApp reply
    await sendWhatsAppMessage(phoneNumber, aiResponse.content);

    // Update lead
    await Lead.findByIdAndUpdate(lead._id, { lastContactedAt: new Date() });

    // Track analytics
    await Analytics.create({ type: 'message_received', leadId: lead._id, channel: 'whatsapp' });

    return { success: true };
  } catch (err) {
    logger.error('WhatsApp webhook handler error:', err);
    return { success: false, error: err.message };
  }
};
