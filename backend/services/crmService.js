// services/crmService.js
// Full multi-CRM: Zoho + Salesforce + HubSpot + Custom Webhook
const axios = require('axios');
const { Lead, Conversation, Settings } = require('../models');
const logger = require('../utils/logger');

// ─── Helpers ─────────────────────────────────────────────────────

const getSettings = async (userId) => {
  try {
    if (userId) return await Settings.findOne({ userId });
    return await Settings.findOne();
  } catch { return null; }
};

// Auto-tag lead based on fields
const buildTags = (lead) => {
  const tags = [];
  if (lead.visaType) tags.push(lead.visaType);
  if (lead.destination) tags.push(lead.destination.toLowerCase());
  if (lead.channel) tags.push(`via_${lead.channel}`);
  if (lead.aiScore >= 80) tags.push('hot_lead');
  else if (lead.aiScore >= 60) tags.push('warm_lead');
  else tags.push('cold_lead');
  const daysSinceCreate = lead.createdAt ? (Date.now() - new Date(lead.createdAt)) / 86400000 : 0;
  if (daysSinceCreate > 7 && lead.status === 'new') tags.push('dormant');
  return tags;
};

// Get full conversation history for CRM sync
const getInteractionHistory = async (leadId) => {
  try {
    const convs = await Conversation.find({ lead: leadId }).lean();
    return convs.map(c => ({
      channel: c.channel,
      messageCount: c.messages?.length || 0,
      lastMessage: c.messages?.[c.messages.length - 1]?.content?.substring(0, 200),
      updatedAt: c.updatedAt,
    }));
  } catch { return []; }
};

// ─── ZOHO CRM ────────────────────────────────────────────────────
const getZohoToken = async () => {
  try {
    const resp = await axios.post('https://accounts.zoho.in/oauth/v2/token', null, {
      params: {
        refresh_token: process.env.ZOHO_REFRESH_TOKEN,
        client_id: process.env.ZOHO_CLIENT_ID,
        client_secret: process.env.ZOHO_CLIENT_SECRET,
        grant_type: 'refresh_token',
      },
    });
    return resp.data.access_token;
  } catch (err) {
    logger.error('Zoho token error:', err.message);
    return null;
  }
};

const zohoCreateLead = async (lead) => {
  const token = await getZohoToken();
  if (!token) throw new Error('Zoho token unavailable');
  const tags = buildTags(lead);
  const resp = await axios.post(
    'https://www.zohoapis.in/crm/v3/Leads',
    {
      data: [{
        Last_Name: lead.name,
        Phone: lead.phone,
        Email: lead.email || '',
        Lead_Source: lead.channel === 'whatsapp' ? 'Chat' : lead.channel === 'voice' ? 'Cold Call' : 'Web',
        Description: `Visa Type: ${lead.visaType} | Destination: ${lead.destination || 'N/A'} | AI Score: ${lead.aiScore || 'N/A'}`,
        Tag: tags.join(','),
        Lead_Status: lead.status === 'approved' ? 'Converted' : lead.status === 'new' ? 'Assigned' : 'In Progress',
        // Custom fields
        Visa_Type__c: lead.visaType,
        Destination_Country__c: lead.destination,
        AI_Score__c: lead.aiScore,
        Priority__c: lead.priority,
      }],
    },
    { headers: { Authorization: `Zoho-oauthtoken ${token}`, 'Content-Type': 'application/json' } }
  );
  return resp.data?.data?.[0]?.details?.id;
};

const zohoUpdateLead = async (lead) => {
  const token = await getZohoToken();
  if (!token || !lead.crmId) return;
  const history = await getInteractionHistory(lead._id);
  await axios.put(
    `https://www.zohoapis.in/crm/v3/Leads/${lead.crmId}`,
    {
      data: [{
        Lead_Status: lead.status === 'approved' ? 'Converted' : 'In Progress',
        Description: `Updated: ${new Date().toISOString()} | Interactions: ${history.length} | Last: ${history[0]?.lastMessage || 'N/A'}`,
        Tag: buildTags(lead).join(','),
        AI_Score__c: lead.aiScore,
      }],
    },
    { headers: { Authorization: `Zoho-oauthtoken ${token}`, 'Content-Type': 'application/json' } }
  );
};

const zohoAddNote = async (crmId, note) => {
  const token = await getZohoToken();
  if (!token || !crmId) return;
  await axios.post(
    `https://www.zohoapis.in/crm/v3/Leads/${crmId}/Notes`,
    { data: [{ Note_Title: 'AI Interaction', Note_Content: note }] },
    { headers: { Authorization: `Zoho-oauthtoken ${token}` } }
  );
};

// ─── SALESFORCE ───────────────────────────────────────────────────
const getSalesforceToken = async () => {
  try {
    const resp = await axios.post(
      `${process.env.SF_INSTANCE_URL || 'https://login.salesforce.com'}/services/oauth2/token`,
      null,
      {
        params: {
          grant_type: 'password',
          client_id: process.env.SF_CLIENT_ID,
          client_secret: process.env.SF_CLIENT_SECRET,
          username: process.env.SF_USERNAME,
          password: process.env.SF_PASSWORD + (process.env.SF_SECURITY_TOKEN || ''),
        },
      }
    );
    return { token: resp.data.access_token, instanceUrl: resp.data.instance_url };
  } catch (err) {
    logger.error('Salesforce token error:', err.message);
    return null;
  }
};

const salesforceCreateLead = async (lead) => {
  const auth = await getSalesforceToken();
  if (!auth) throw new Error('Salesforce auth unavailable');
  const tags = buildTags(lead);
  const resp = await axios.post(
    `${auth.instanceUrl}/services/data/v58.0/sobjects/Lead`,
    {
      LastName: lead.name.split(' ').slice(-1)[0] || lead.name,
      FirstName: lead.name.split(' ').slice(0, -1).join(' ') || '',
      Phone: lead.phone,
      Email: lead.email || '',
      Company: 'Individual - Visa Applicant',
      LeadSource: lead.channel === 'whatsapp' ? 'Chat' : lead.channel === 'voice' ? 'Phone' : 'Web',
      Description: `Visa: ${lead.visaType} | Destination: ${lead.destination || 'N/A'} | AI Score: ${lead.aiScore || 'N/A'} | Tags: ${tags.join(', ')}`,
      Status: 'Open - Not Contacted',
      Rating: lead.priority === 'hot' ? 'Hot' : lead.priority === 'high' ? 'Warm' : 'Cold',
    },
    { headers: { Authorization: `Bearer ${auth.token}`, 'Content-Type': 'application/json' } }
  );
  return resp.data?.id;
};

const salesforceUpdateLead = async (lead) => {
  const auth = await getSalesforceToken();
  if (!auth || !lead.crmId) return;
  const history = await getInteractionHistory(lead._id);
  await axios.patch(
    `${auth.instanceUrl}/services/data/v58.0/sobjects/Lead/${lead.crmId}`,
    {
      Status: lead.status === 'approved' ? 'Closed - Converted' : 'Working - Contacted',
      Rating: lead.priority === 'hot' ? 'Hot' : 'Warm',
      Description: `AI Score: ${lead.aiScore} | Interactions: ${history.length} | Updated: ${new Date().toISOString()}`,
    },
    { headers: { Authorization: `Bearer ${auth.token}`, 'Content-Type': 'application/json' } }
  );
};

// ─── HUBSPOT ──────────────────────────────────────────────────────
const hubspotCreateLead = async (lead) => {
  const apiKey = process.env.HUBSPOT_API_KEY;
  if (!apiKey) throw new Error('HubSpot API key not configured');
  const tags = buildTags(lead);
  const resp = await axios.post(
    'https://api.hubapi.com/crm/v3/objects/contacts',
    {
      properties: {
        firstname: lead.name.split(' ')[0] || lead.name,
        lastname: lead.name.split(' ').slice(1).join(' ') || '',
        phone: lead.phone,
        email: lead.email || '',
        hs_lead_status: 'NEW',
        lifecyclestage: 'lead',
        description: `Visa: ${lead.visaType} | Destination: ${lead.destination || 'N/A'} | Channel: ${lead.channel}`,
        // Custom properties (must exist in HubSpot portal)
        visa_type: lead.visaType,
        destination_country: lead.destination || '',
        ai_score: String(lead.aiScore || 0),
        lead_tags: tags.join(', '),
      },
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    }
  );
  return resp.data?.id;
};

const hubspotUpdateLead = async (lead) => {
  const apiKey = process.env.HUBSPOT_API_KEY;
  if (!apiKey || !lead.crmId) return;
  const history = await getInteractionHistory(lead._id);
  await axios.patch(
    `https://api.hubapi.com/crm/v3/objects/contacts/${lead.crmId}`,
    {
      properties: {
        hs_lead_status: lead.status === 'approved' ? 'CONVERTED' : 'IN_PROGRESS',
        ai_score: String(lead.aiScore || 0),
        notes_last_updated: new Date().toISOString(),
        num_notes: String(history.length),
      },
    },
    { headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' } }
  );
};

const hubspotAddNote = async (contactId, note) => {
  const apiKey = process.env.HUBSPOT_API_KEY;
  if (!apiKey || !contactId) return;
  const engagement = await axios.post(
    'https://api.hubapi.com/crm/v3/objects/notes',
    {
      properties: {
        hs_note_body: note,
        hs_timestamp: new Date().toISOString(),
      },
    },
    { headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' } }
  );
  // Associate note with contact
  await axios.put(
    `https://api.hubapi.com/crm/v3/objects/notes/${engagement.data.id}/associations/contacts/${contactId}/note_to_contact`,
    {},
    { headers: { Authorization: `Bearer ${apiKey}` } }
  );
};

// ─── CUSTOM WEBHOOK ───────────────────────────────────────────────
const customWebhookSync = async (lead, event = 'lead.created') => {
  const endpoint = process.env.CUSTOM_CRM_WEBHOOK_URL;
  if (!endpoint) return null;
  const tags = buildTags(lead);
  const history = await getInteractionHistory(lead._id);
  const payload = {
    event,
    timestamp: new Date().toISOString(),
    lead: {
      id: lead._id,
      name: lead.name,
      phone: lead.phone,
      email: lead.email,
      visaType: lead.visaType,
      destination: lead.destination,
      status: lead.status,
      priority: lead.priority,
      channel: lead.channel,
      aiScore: lead.aiScore,
      tags,
      interactionHistory: history,
      createdAt: lead.createdAt,
    },
  };
  const secret = process.env.CUSTOM_CRM_WEBHOOK_SECRET;
  const headers = { 'Content-Type': 'application/json' };
  if (secret) headers['X-VisaAI-Signature'] = require('crypto').createHmac('sha256', secret).update(JSON.stringify(payload)).digest('hex');

  const resp = await axios.post(endpoint, payload, { headers, timeout: 10000 });
  return resp.data;
};

// ─── INTELLIGENT TAGGING ──────────────────────────────────────────
exports.applyIntelligentTags = async (lead) => {
  try {
    const tags = buildTags(lead);
    await Lead.findByIdAndUpdate(lead._id, { tags, $set: { updatedAt: new Date() } });
    logger.info(`Tags applied to lead ${lead._id}: ${tags.join(', ')}`);
    return tags;
  } catch (err) {
    logger.error('applyIntelligentTags error:', err.message);
    return [];
  }
};

// ─── DORMANT LEAD RE-ENGAGEMENT ───────────────────────────────────
exports.findAndReengageDormantLeads = async () => {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const dormantLeads = await Lead.find({
      status: { $in: ['new', 'contacted'] },
      lastContactedAt: { $lt: sevenDaysAgo },
    }).limit(50);

    if (!dormantLeads.length) return { count: 0, leads: [] };

    // Mark as dormant and trigger re-engagement
    await Lead.updateMany(
      { _id: { $in: dormantLeads.map(l => l._id) } },
      { $addToSet: { tags: 'dormant' }, $set: { priority: 'low' } }
    );

    logger.info(`Found ${dormantLeads.length} dormant leads for re-engagement`);
    return { count: dormantLeads.length, leads: dormantLeads };
  } catch (err) {
    logger.error('findDormantLeads error:', err.message);
    return { count: 0, leads: [] };
  }
};

// ─── SYNC INTERACTION HISTORY TO CRM ─────────────────────────────
exports.syncInteractionHistory = async (lead, message, channel) => {
  try {
    const settings = await getSettings();
    const provider = settings?.crm?.provider;
    const noteText = `[${channel?.toUpperCase()}] ${new Date().toLocaleString('en-IN')} — ${message?.substring(0, 300)}`;

    if (provider === 'zoho' && lead.crmId) await zohoAddNote(lead.crmId, noteText).catch(logger.error);
    if (provider === 'hubspot' && lead.crmId) await hubspotAddNote(lead.crmId, noteText).catch(logger.error);
    if (provider === 'custom') await customWebhookSync(lead, 'interaction.added').catch(logger.error);
  } catch (err) {
    logger.error('syncInteractionHistory error:', err.message);
  }
};

// ─── MAIN EXPORTS ─────────────────────────────────────────────────
exports.createLead = async (lead) => {
  try {
    const settings = await getSettings();
    const provider = settings?.crm?.provider || process.env.DEFAULT_CRM_PROVIDER || 'zoho';

    // Always apply intelligent tags first
    await exports.applyIntelligentTags(lead);

    let crmId = null;
    if (provider === 'zoho') crmId = await zohoCreateLead(lead);
    else if (provider === 'salesforce') crmId = await salesforceCreateLead(lead);
    else if (provider === 'hubspot') crmId = await hubspotCreateLead(lead);
    else if (provider === 'custom') await customWebhookSync(lead, 'lead.created');

    if (crmId) await Lead.findByIdAndUpdate(lead._id, { crmId, crmSynced: true });
    logger.info(`Lead synced to ${provider} CRM: ${crmId || 'webhook'}`);
    return crmId;
  } catch (err) {
    logger.error(`CRM createLead (${err.message})`);
    return null;
  }
};

exports.updateLead = async (lead) => {
  try {
    const settings = await getSettings();
    const provider = settings?.crm?.provider || 'zoho';

    await exports.applyIntelligentTags(lead);

    if (provider === 'zoho') await zohoUpdateLead(lead);
    else if (provider === 'salesforce') await salesforceUpdateLead(lead);
    else if (provider === 'hubspot') await hubspotUpdateLead(lead);
    else if (provider === 'custom') await customWebhookSync(lead, 'lead.updated');

    return true;
  } catch (err) {
    logger.error(`CRM updateLead: ${err.message}`);
    return false;
  }
};

exports.testConnection = async (provider, config) => {
  try {
    if (provider === 'zoho') {
      const token = await getZohoToken();
      return { success: !!token, message: token ? 'Zoho connected ✅' : 'Token fetch failed' };
    }
    if (provider === 'salesforce') {
      const auth = await getSalesforceToken();
      return { success: !!auth, message: auth ? 'Salesforce connected ✅' : 'Auth failed' };
    }
    if (provider === 'hubspot') {
      const resp = await axios.get('https://api.hubapi.com/crm/v3/objects/contacts?limit=1', {
        headers: { Authorization: `Bearer ${process.env.HUBSPOT_API_KEY}` },
      });
      return { success: resp.status === 200, message: 'HubSpot connected ✅' };
    }
    if (provider === 'custom') {
      return { success: !!process.env.CUSTOM_CRM_WEBHOOK_URL, message: process.env.CUSTOM_CRM_WEBHOOK_URL ? 'Custom webhook configured ✅' : 'No webhook URL set' };
    }
    return { success: false, message: 'Unknown provider' };
  } catch (err) {
    return { success: false, message: err.message };
  }
};