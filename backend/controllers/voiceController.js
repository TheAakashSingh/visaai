const twilio = require('twilio');
const { Call, Lead, Analytics } = require('../models');
const aiService = require('../services/aiService');
const logger = require('../utils/logger');

const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const VoiceResponse = twilio.twiml.VoiceResponse;

// POST /api/voice/call — Initiate outbound call
exports.makeCall = async (req, res) => {
  try {
    const { leadId, toNumber } = req.body;

    const lead = await Lead.findById(leadId);
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });

    const call = await twilioClient.calls.create({
      url: `${process.env.BACKEND_URL || 'https://api.yourdomain.com'}/webhooks/voice/twiml?leadId=${leadId}`,
      to: toNumber || lead.phone,
      from: process.env.TWILIO_PHONE_NUMBER,
      statusCallback: `${process.env.BACKEND_URL || 'https://api.yourdomain.com'}/webhooks/voice/status`,
      statusCallbackMethod: 'POST',
      record: true,
      recordingStatusCallback: `${process.env.BACKEND_URL || 'https://api.yourdomain.com'}/webhooks/voice/recording`,
    });

    // Save call log
    const callLog = await Call.create({
      lead: leadId,
      type: 'outbound',
      status: 'initiated',
      twilioCallSid: call.sid,
      toNumber: toNumber || lead.phone,
      fromNumber: process.env.TWILIO_PHONE_NUMBER,
      startedAt: new Date(),
      aiHandled: true,
    });

    await Analytics.create({ type: 'call_made', leadId, channel: 'voice' });
    req.app.get('io')?.emit('call:started', callLog);

    logger.info(`Outbound call initiated to ${toNumber || lead.phone}`);
    res.json({ success: true, data: { callSid: call.sid, callId: callLog._id } });
  } catch (err) {
    logger.error('makeCall error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /webhooks/voice/twiml — TwiML for all call scripts
exports.getTwiML = async (req, res) => {
  try {
    const { leadId, script, date, time, msg } = req.query;
    const twiml = new VoiceResponse();
    const lead = leadId ? await Lead.findById(leadId).lean() : null;
    const name = lead?.name && lead.name !== 'WhatsApp User' ? lead.name : 'valued client';

    if (script === 'appointment') {
      twiml.say({ voice: 'Polly.Aditi', language: 'en-IN' },
        `Hello ${name}! This is Priya from VisaAI Pro. Calling to confirm your appointment on ${date} at ${time}. Press 1 to confirm or 2 to reschedule.`);
      const g = twiml.gather({ numDigits: 1, action: `/webhooks/voice/respond?leadId=${leadId}&script=appointment_response`, timeout: 10 });
      g.say({ voice: 'Polly.Aditi' }, 'Press 1 to confirm, or 2 to reschedule.');
      twiml.say({ voice: 'Polly.Aditi' }, 'We will follow up with you. Thank you!');

    } else if (script === 'status') {
      const statusMsg = msg ? decodeURIComponent(msg) : `Your visa application status has been updated to ${lead?.status || 'in progress'}.`;
      twiml.say({ voice: 'Polly.Aditi', language: 'en-IN' },
        `Hello ${name}! This is an update from VisaAI Pro. ${statusMsg} For details, reply on WhatsApp or call us. Dhanyawaad!`);

    } else if (script === 'survey') {
      twiml.say({ voice: 'Polly.Aditi', language: 'en-IN' },
        `Hello ${name}! This is Priya from VisaAI Pro with a quick satisfaction survey.`);
      const g = twiml.gather({ numDigits: 1, action: `/webhooks/voice/respond?leadId=${leadId}&script=survey_response`, timeout: 10 });
      g.say({ voice: 'Polly.Aditi' }, 'Press 1 to 5 to rate our service. 5 is excellent.');
      twiml.say({ voice: 'Polly.Aditi' }, 'Thank you for your time! Have a wonderful day!');

    } else if (script === 'reengage') {
      twiml.say({ voice: 'Polly.Aditi', language: 'en-IN' },
        `Hello ${name}! This is Priya from VisaAI Pro. We noticed your visa inquiry and wanted to check if you still need assistance.`);
      const g = twiml.gather({ input: 'speech', action: `/webhooks/voice/respond?leadId=${leadId}&script=reengage`, timeout: 8, speechTimeout: 3 });
      g.say({ voice: 'Polly.Aditi' }, 'Are you still interested in visa services? Please speak after the tone.');
      twiml.say({ voice: 'Polly.Aditi' }, 'Thank you for your time. We are always here if you need visa help. Goodbye!');

    } else {
      const greeting = lead
        ? `Hello ${name}! This is Priya calling from VisaAI Pro regarding your visa inquiry.`
        : `Namaste! Welcome to VisaAI Pro. This is Priya your AI visa assistant.`;
      twiml.say({ voice: 'Polly.Aditi', language: 'en-IN' }, greeting);
      const gather = twiml.gather({
        input: 'speech', speechModel: 'phone_call', language: 'en-IN',
        action: `/webhooks/voice/respond${leadId ? `?leadId=${leadId}` : ''}`,
        speechTimeout: 3, timeout: 10,
      });
      gather.say({ voice: 'Polly.Aditi', language: 'en-IN' }, 'How can I assist you with your visa application today?');
      twiml.redirect(`/webhooks/voice/twiml${leadId ? `?leadId=${leadId}` : ''}`);
    }

    res.type('text/xml');
    res.send(twiml.toString());
  } catch (err) {
    logger.error('TwiML error:', err);
    const twiml = new VoiceResponse();
    twiml.say('Thank you for calling VisaAI Pro. Our team will contact you shortly.');
    res.type('text/xml');
    res.send(twiml.toString());
  }
};

// POST /webhooks/voice/respond — Handle speech input
exports.handleSpeech = async (req, res) => {
  try {
    const { SpeechResult, Confidence, CallSid } = req.body;
    const { leadId } = req.query;
    const twiml = new VoiceResponse();

    if (!SpeechResult || parseFloat(Confidence) < 0.5) {
      twiml.say({ voice: 'Polly.Aditi' }, "I'm sorry, I didn't catch that. Could you please repeat?");
      const gather = twiml.gather({ input: 'speech', action: `/webhooks/voice/respond?leadId=${leadId}`, timeout: 8 });
      gather.say({ voice: 'Polly.Aditi' }, 'Please tell me about your visa requirement.');
      res.type('text/xml');
      return res.send(twiml.toString());
    }

    logger.info(`Voice input: "${SpeechResult}" (confidence: ${Confidence})`);

    // Get AI response for voice
    const lead = leadId ? await Lead.findById(leadId) : null;
    const history = []; // In production, maintain call conversation history in Redis
    const aiResponse = await aiService.chatWithLeadContext(SpeechResult, history, lead);

    // Keep response concise for voice
    const voiceResponse = aiResponse.content.replace(/[*_#]/g, '').substring(0, 500);

    twiml.say({ voice: 'Polly.Aditi', language: 'en-IN' }, voiceResponse);

    const gather = twiml.gather({
      input: 'speech',
      action: `/webhooks/voice/respond?leadId=${leadId}`,
      timeout: 8,
      speechTimeout: 3,
    });
    gather.say({ voice: 'Polly.Aditi' }, 'Do you have any other questions?');

    twiml.say({ voice: 'Polly.Aditi' },
      'Thank you for calling VisaAI Pro. Our consultant will follow up with you shortly. Have a great day!');
    twiml.hangup();

    res.type('text/xml');
    res.send(twiml.toString());
  } catch (err) {
    logger.error('handleSpeech error:', err);
    const twiml = new VoiceResponse();
    twiml.say('Thank you for your inquiry. Our team will contact you shortly. Goodbye!');
    twiml.hangup();
    res.type('text/xml');
    res.send(twiml.toString());
  }
};

// POST /webhooks/voice/status — Call status updates
exports.handleStatus = async (req, res) => {
  try {
    const { CallSid, CallStatus, CallDuration } = req.body;

    const callLog = await Call.findOneAndUpdate(
      { twilioCallSid: CallSid },
      {
        status: CallStatus,
        duration: CallDuration ? parseInt(CallDuration) : 0,
        endedAt: ['completed', 'failed', 'no-answer', 'busy'].includes(CallStatus) ? new Date() : undefined,
      },
      { new: true }
    );

    if (callLog) {
      // Emit socket event
      // We use global app reference - in production pass io properly
      const ioInstance = global.io;
      ioInstance?.emit('call:updated', callLog);
    }

    res.sendStatus(200);
  } catch (err) {
    logger.error('Call status error:', err);
    res.sendStatus(500);
  }
};

// POST /api/voice/appointment-confirm — confirm appointment via AI call
exports.confirmAppointment = async (req, res) => {
  try {
    const { leadId, appointmentDate, appointmentTime } = req.body;
    const lead = await Lead.findById(leadId);
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });

    const twimlBody = `${process.env.BACKEND_URL || 'https://api.yourdomain.com'}/webhooks/voice/twiml?leadId=${leadId}&script=appointment&date=${encodeURIComponent(appointmentDate)}&time=${encodeURIComponent(appointmentTime)}`;

    const call = await twilioClient.calls.create({
      url: twimlBody,
      to: lead.phone,
      from: process.env.TWILIO_PHONE_NUMBER,
      statusCallback: `${process.env.BACKEND_URL || 'https://api.yourdomain.com'}/webhooks/voice/status`,
      statusCallbackMethod: 'POST',
    });

    const callLog = await Call.create({
      lead: leadId,
      type: 'outbound',
      status: 'initiated',
      twilioCallSid: call.sid,
      toNumber: lead.phone,
      fromNumber: process.env.TWILIO_PHONE_NUMBER,
      notes: `Appointment confirmation: ${appointmentDate} at ${appointmentTime}`,
      startedAt: new Date(),
      aiHandled: true,
    });

    req.app.get('io')?.emit('call:started', callLog);
    res.json({ success: true, data: { callSid: call.sid, callId: callLog._id } });
  } catch (err) {
    logger.error('confirmAppointment error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/voice/status-update — proactive application status call
exports.sendStatusUpdate = async (req, res) => {
  try {
    const { leadId, statusMessage } = req.body;
    const lead = await Lead.findById(leadId);
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });

    const call = await twilioClient.calls.create({
      url: `${process.env.BACKEND_URL || 'https://api.yourdomain.com'}/webhooks/voice/twiml?leadId=${leadId}&script=status&msg=${encodeURIComponent(statusMessage || `Your visa application status has been updated to ${lead.status}. Our consultant will contact you shortly.`)}`,
      to: lead.phone,
      from: process.env.TWILIO_PHONE_NUMBER,
      statusCallback: `${process.env.BACKEND_URL || 'https://api.yourdomain.com'}/webhooks/voice/status`,
    });

    const callLog = await Call.create({
      lead: leadId, type: 'outbound', status: 'initiated',
      twilioCallSid: call.sid, toNumber: lead.phone,
      fromNumber: process.env.TWILIO_PHONE_NUMBER,
      notes: `Status update call: ${lead.status}`,
      startedAt: new Date(), aiHandled: true,
    });

    req.app.get('io')?.emit('call:started', callLog);
    res.json({ success: true, data: { callSid: call.sid } });
  } catch (err) {
    logger.error('sendStatusUpdate error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/voice/satisfaction-survey — AI satisfaction survey call
exports.conductSurvey = async (req, res) => {
  try {
    const { leadId } = req.body;
    const lead = await Lead.findById(leadId);
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });

    const call = await twilioClient.calls.create({
      url: `${process.env.BACKEND_URL || 'https://api.yourdomain.com'}/webhooks/voice/twiml?leadId=${leadId}&script=survey`,
      to: lead.phone,
      from: process.env.TWILIO_PHONE_NUMBER,
      statusCallback: `${process.env.BACKEND_URL || 'https://api.yourdomain.com'}/webhooks/voice/status`,
    });

    const callLog = await Call.create({
      lead: leadId, type: 'outbound', status: 'initiated',
      twilioCallSid: call.sid, toNumber: lead.phone,
      fromNumber: process.env.TWILIO_PHONE_NUMBER,
      notes: 'Satisfaction survey call',
      startedAt: new Date(), aiHandled: true,
    });

    res.json({ success: true, data: { callSid: call.sid, callId: callLog._id } });
  } catch (err) {
    logger.error('conductSurvey error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/voice/reengage — re-engage dormant lead
exports.reengageDormantLead = async (req, res) => {
  try {
    const { leadId } = req.body;
    const lead = await Lead.findById(leadId);
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });

    const call = await twilioClient.calls.create({
      url: `${process.env.BACKEND_URL || 'https://api.yourdomain.com'}/webhooks/voice/twiml?leadId=${leadId}&script=reengage`,
      to: lead.phone,
      from: process.env.TWILIO_PHONE_NUMBER,
      statusCallback: `${process.env.BACKEND_URL || 'https://api.yourdomain.com'}/webhooks/voice/status`,
    });

    const callLog = await Call.create({
      lead: leadId, type: 'outbound', status: 'initiated',
      twilioCallSid: call.sid, toNumber: lead.phone,
      fromNumber: process.env.TWILIO_PHONE_NUMBER,
      notes: 'Dormant lead re-engagement call',
      startedAt: new Date(), aiHandled: true,
    });

    // Update lead status
    await Lead.findByIdAndUpdate(leadId, { lastContactedAt: new Date(), $pull: { tags: 'dormant' } });

    req.app.get('io')?.emit('call:started', callLog);
    res.json({ success: true, data: { callSid: call.sid, callId: callLog._id } });
  } catch (err) {
    logger.error('reengageDormantLead error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getCallLogs = async (req, res) => {
  try {
    const { page = 1, limit = 20, type, status } = req.query;
    const query = {};
    if (type) query.type = type;
    if (status) query.status = status;

    const [calls, total] = await Promise.all([
      Call.find(query)
        .populate('lead', 'name phone visaType')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit)),
      Call.countDocuments(query),
    ]);

    res.json({ success: true, data: calls, pagination: { total, page: Number(page) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// GET /api/voice/stats
exports.getStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [todayCalls, inboundToday, outboundToday, avgDurationResult] = await Promise.all([
      Call.countDocuments({ createdAt: { $gte: today } }),
      Call.countDocuments({ type: 'inbound', createdAt: { $gte: today } }),
      Call.countDocuments({ type: 'outbound', createdAt: { $gte: today } }),
      Call.aggregate([
        { $match: { status: 'completed', duration: { $gt: 0 } } },
        { $group: { _id: null, avgDuration: { $avg: '$duration' } } },
      ]),
    ]);

    const avgDuration = avgDurationResult[0]?.avgDuration || 0;
    const minutes = Math.floor(avgDuration / 60);
    const seconds = Math.floor(avgDuration % 60);

    res.json({
      success: true,
      data: {
        todayCalls,
        inboundToday,
        outboundToday,
        avgDuration: `${minutes}:${seconds.toString().padStart(2, '0')}`,
        activeCalls: 0, // In production, track via Twilio real-time
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};