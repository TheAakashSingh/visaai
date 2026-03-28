// routes/webhooks.js
const express = require('express');
const router = express.Router();
const axios = require('axios');
const chatbotCtrl = require('../controllers/chatbotController');
const voiceCtrl = require('../controllers/voiceController');
const logger = require('../utils/logger');

// ─── Middleware helpers ───────────────────────────────────────────
const jsonParser      = express.json({ limit: '5mb' });
const urlencodedParser = express.urlencoded({ extended: false, limit: '5mb' });

// ─── WhatsApp Media: download and auto-OCR ────────────────────────
async function handleWhatsAppMedia(fromPhone, mediaId, caption) {
  try {
    // 1. Get media URL from Meta
    const mediaResp = await axios.get(
      `https://graph.facebook.com/v18.0/${mediaId}`,
      { headers: { Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}` } }
    );
    const mediaUrl = mediaResp.data?.url;
    if (!mediaUrl) return;

    // 2. Download media
    const fileResp = await axios.get(mediaUrl, {
      headers: { Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}` },
      responseType: 'arraybuffer',
    });
    const base64Data = Buffer.from(fileResp.data).toString('base64');
    const mimeType = fileResp.headers['content-type'] || 'image/jpeg';

    // 3. Send to AI service for OCR
    const aiResp = await axios.post(
      `${process.env.AI_SERVICE_URL}/ocr/process`,
      { image_data: base64Data, mime_type: mimeType, document_type: 'auto' },
      { headers: { Authorization: `Bearer ${process.env.AI_SERVICE_SECRET}` }, timeout: 30000 }
    );
    const ocr = aiResp.data;

    // 4. Find lead by phone and save document
    const { Lead, Document } = require('../models');
    const lead = await Lead.findOne({ phone: fromPhone });

    // Build WhatsApp reply
    let reply = '📄 *Document processed!*\n\n';
    if (ocr.full_name) reply += `👤 *Name:* ${ocr.full_name}\n`;
    if (ocr.document_number) reply += `🔢 *Doc No:* ${ocr.document_number}\n`;
    if (ocr.date_of_birth) reply += `🎂 *DOB:* ${ocr.date_of_birth}\n`;
    if (ocr.expiry_date) reply += `📅 *Expiry:* ${ocr.expiry_date}\n`;
    if (ocr.nationality) reply += `🌍 *Nationality:* ${ocr.nationality}\n`;

    // Expiry warning
    if (ocr.expiry_date) {
      const exp = new Date(ocr.expiry_date);
      const months = (exp - new Date()) / (1000 * 60 * 60 * 24 * 30);
      if (months < 0) reply += '\n⚠️ *WARNING: Document has EXPIRED!*';
      else if (months < 6) reply += `\n⚠️ *Document expires in ${Math.floor(months)} months. Renewal recommended.*`;
      else reply += '\n✅ Document validity: Good';
    }

    reply += '\n\nOur consultant will review and contact you shortly. 🙏';

    // Send reply via WhatsApp
    await axios.post(
      `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_ID}/messages`,
      { messaging_product: 'whatsapp', to: fromPhone, type: 'text', text: { body: reply } },
      { headers: { Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}` } }
    );

    // Save document record if lead found
    if (lead) {
      const doc = await Document.create({
        lead: lead._id,
        originalName: `whatsapp_${mediaId}`,
        type: ocr.detected_type || 'passport',
        mimeType,
        ocrProcessed: true,
        ocrData: {
          fullName: ocr.full_name,
          dateOfBirth: ocr.date_of_birth,
          documentNumber: ocr.document_number,
          issueDate: ocr.issue_date,
          expiryDate: ocr.expiry_date,
          nationality: ocr.nationality,
          gender: ocr.gender,
          confidence: ocr.confidence,
        },
        processedAt: new Date(),
      });
      await Lead.findByIdAndUpdate(lead._id, { $addToSet: { documents: doc._id } });
      if (ocr.full_name && lead.name === 'WhatsApp User') {
        await Lead.findByIdAndUpdate(lead._id, { name: ocr.full_name });
      }
      // Sync to CRM
      const crmService = require('../services/crmService');
      crmService.syncInteractionHistory(lead, `Document OCR: ${ocr.full_name || 'Unknown'}`, 'whatsapp').catch(logger.error);
    }

    logger.info(`WhatsApp media OCR complete for ${fromPhone}: ${ocr.full_name}`);
  } catch (err) {
    logger.error('handleWhatsAppMedia error:', err.message);
    // Send fallback message
    try {
      await axios.post(
        `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_ID}/messages`,
        { messaging_product: 'whatsapp', to: fromPhone, type: 'text', text: { body: 'Thank you for sending your document! Our team will review it and contact you shortly. 🙏' } },
        { headers: { Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}` } }
      );
    } catch {}
  }
}

// ---- WhatsApp Webhook Verification (GET) ----
router.get('/whatsapp', (req, res) => {
  const mode      = req.query['hub.mode'];
  const token     = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    logger.info('WhatsApp webhook verified ✅');
    return res.status(200).send(challenge);
  }
  logger.warn('WhatsApp webhook verification failed');
  res.sendStatus(403);
});

// ---- WhatsApp Incoming Messages (POST) ----
router.post('/whatsapp', jsonParser, async (req, res) => {
  try {
    const body = req.body;
    // Always ack immediately so Meta doesn't retry
    res.sendStatus(200);

    if (body.object !== 'whatsapp_business_account') return;

    const messages = body.entry?.[0]?.changes?.[0]?.value?.messages;
    if (!messages?.length) return;

    for (const message of messages) {
      const from = message.from;

      // Handle TEXT messages
      if (message.type === 'text') {
        chatbotCtrl.handleWebhook(from, message.text.body, message.id)
          .catch(err => logger.error('WA text webhook error:', err));
        continue;
      }

      // Handle IMAGE / DOCUMENT messages → auto OCR
      if (message.type === 'image' || message.type === 'document') {
        const mediaId = message.image?.id || message.document?.id;
        const caption = message.image?.caption || message.document?.caption || '';
        if (mediaId) {
          handleWhatsAppMedia(from, mediaId, caption)
            .catch(err => logger.error('WA media webhook error:', err));
        }
        continue;
      }

      // Handle AUDIO messages (voice notes)
      if (message.type === 'audio') {
        chatbotCtrl.handleWebhook(from, '[Voice message received — please type your query or send your passport image]', message.id)
          .catch(err => logger.error('WA audio webhook error:', err));
        continue;
      }
    }
  } catch (err) {
    logger.error('WhatsApp webhook error:', err);
  }
});

// ---- Twilio: Inbound Call (initial greeting TwiML) ----
router.post('/voice/inbound', urlencodedParser, async (req, res) => {
  const { From, CallSid } = req.body || {};
  logger.info(`Inbound call from ${From}, SID: ${CallSid}`);
  // Delegate to getTwiML controller (no leadId for unknown callers)
  voiceCtrl.getTwiML(req, res);
});

// ---- Twilio: TwiML script for outbound/inbound ----
router.post('/voice/twiml', urlencodedParser, voiceCtrl.getTwiML);

// ---- Twilio: Handle speech input from caller ----
router.post('/voice/respond', urlencodedParser, voiceCtrl.handleSpeech);

// ---- Twilio: Call status updates ----
router.post('/voice/status', urlencodedParser, voiceCtrl.handleStatus);

// ---- Twilio: Recording available ----
router.post('/voice/recording', urlencodedParser, async (req, res) => {
  try {
    const { CallSid, RecordingUrl, RecordingDuration } = req.body || {};
    logger.info(`Recording ready for ${CallSid}: ${RecordingUrl}`);
    const { Call } = require('../models');
    await Call.findOneAndUpdate(
      { twilioCallSid: CallSid },
      { recordingUrl: RecordingUrl, duration: parseInt(RecordingDuration) || 0 }
    );
    res.sendStatus(200);
  } catch (err) {
    logger.error('Recording webhook error:', err);
    res.sendStatus(500);
  }
});

module.exports = router;