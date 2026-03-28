const OpenAI = require('openai');
const axios = require('axios');
const logger = require('../utils/logger');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = `You are VisaAI Pro, an expert AI visa consultation assistant for an Indian immigration consultancy called SinghJi Tech. You are knowledgeable about visa requirements for all countries especially relevant to Indian citizens.

Key behaviors:
1. Respond in the same language as the user (auto-detect Hindi/English/Hinglish)
2. Be concise but thorough — cover key requirements
3. Always ask for specific details if not provided (destination country, visa type, travel purpose)
4. Mention processing times and fees when relevant
5. Flag any document expiry issues proactively
6. Warm, professional, helpful tone
7. If asked about pricing, mention "our consultant will provide exact quotes"
8. Always offer to connect with a human consultant for complex cases

Countries you specialize in: Canada, USA, UK, Australia, Germany, Schengen (all European countries), UAE, New Zealand, Singapore, Japan, etc.

Visa types: Student, Work Permit, Tourist, Business, PR/Settlement, Family Reunion, Transit`;

// Main chat function
exports.chat = async (message, history = [], language = 'auto') => {
  try {
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history.map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content })),
      { role: 'user', content: message },
    ];

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
      messages,
      max_tokens: 600,
      temperature: 0.7,
    });

    const content = response.choices[0].message.content;
    const detectedLang = detectLanguage(message);

    return { content, language: detectedLang, tokens: response.usage };
  } catch (err) {
    logger.error('OpenAI chat error:', err);
    // Fallback response
    return {
      content: 'I apologize, I\'m experiencing a temporary issue. Please try again or call us directly. आपसे जल्द बात करेंगे! 🙏',
      language: 'en',
    };
  }
};

// Chat with lead context
exports.chatWithLeadContext = async (message, history = [], lead = null) => {
  try {
    let systemWithContext = SYSTEM_PROMPT;

    if (lead) {
      systemWithContext += `\n\nCurrent client context:
- Name: ${lead.name}
- Phone: ${lead.phone}
- Visa Type Interest: ${lead.visaType || 'Not specified'}
- Destination: ${lead.destination || 'Not specified'}
- Status: ${lead.status}
- Notes: ${lead.notes || 'None'}
Personalize your responses for this client.`;
    }

    const messages = [
      { role: 'system', content: systemWithContext },
      ...history.slice(-6).map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content })),
      { role: 'user', content: message },
    ];

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
      messages,
      max_tokens: 500,
      temperature: 0.6,
    });

    const content = response.choices[0].message.content;

    // Extract lead info if mentioned
    const leadInfo = extractLeadInfo(message, content);

    return { content, language: detectLanguage(message), leadInfo };
  } catch (err) {
    logger.error('chatWithLeadContext error:', err);
    return { content: 'Thank you for your message. Our team will get back to you soon! 🙏', language: 'en' };
  }
};

// AI Lead Scoring
exports.scoreLead = async (lead) => {
  try {
    const prompt = `Score this visa consultation lead from 0-100 based on conversion likelihood.

Lead details:
- Name: ${lead.name}
- Visa Type: ${lead.visaType}
- Destination: ${lead.destination}
- Channel: ${lead.channel}
- Status: ${lead.status}
- Notes: ${lead.notes || 'None'}
- Created: ${lead.createdAt}

Return ONLY valid JSON: {"score": <0-100>, "priority": "<low|medium|high|hot>", "summary": "<2 sentence explanation>", "nextAction": "<recommended next action>"}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 200,
      temperature: 0.3,
    });

    const raw = response.choices[0].message.content.trim();
    const clean = raw.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  } catch (err) {
    logger.error('scoreLead error:', err);
    return { score: 50, priority: 'medium', summary: 'Unable to score automatically.', nextAction: 'Follow up via WhatsApp' };
  }
};

// Generate AI summary for conversation
exports.summarizeConversation = async (messages) => {
  try {
    const conversation = messages
      .map(m => `${m.role.toUpperCase()}: ${m.content}`)
      .join('\n');

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{
        role: 'user',
        content: `Summarize this visa consultation conversation in 2-3 sentences, highlighting key requirements discussed and client intent:\n\n${conversation}`,
      }],
      max_tokens: 150,
    });

    return response.choices[0].message.content;
  } catch (err) {
    logger.error('summarize error:', err);
    return 'Conversation summary not available.';
  }
};

// Forward to Python AI service for OCR/advanced AI
exports.processWithPythonService = async (endpoint, data) => {
  try {
    const response = await axios.post(
      `${process.env.AI_SERVICE_URL}${endpoint}`,
      data,
      {
        headers: {
          Authorization: `Bearer ${process.env.AI_SERVICE_SECRET}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );
    return response.data;
  } catch (err) {
    logger.error(`Python service error (${endpoint}):`, err.message);
    throw err;
  }
};

// Helper: detect language
function detectLanguage(text) {
  const hindiPattern = /[\u0900-\u097F]/;
  if (hindiPattern.test(text)) return 'hi';
  const hinglishWords = ['kya', 'hai', 'mujhe', 'chahiye', 'kaise', 'kitna', 'lagega', 'bata', 'visa', 'mil'];
  const lowerText = text.toLowerCase();
  if (hinglishWords.some(w => lowerText.includes(w))) return 'hinglish';
  return 'en';
}

// Helper: extract lead info from conversation
function extractLeadInfo(userMsg, botResponse) {
  const info = {};
  const destMatch = userMsg.match(/\b(canada|usa|uk|germany|australia|schengen|uae|japan|singapore|new zealand)\b/i);
  if (destMatch) info.destination = destMatch[1];

  const visaMatch = userMsg.match(/\b(student|work|tourist|business|pr|family)\b/i);
  if (visaMatch) info.visaType = visaMatch[1];

  return Object.keys(info).length > 0 ? info : null;
}
