require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const connectDB = require('./config/db');
const connectRedis = require('./config/redis');
const logger = require('./utils/logger');
const { socketHandler } = require('./services/socketService');

const authRoutes       = require('./routes/auth');
const leadRoutes       = require('./routes/leads');
const chatbotRoutes    = require('./routes/chatbot');
const voiceRoutes      = require('./routes/voice');
const ocrRoutes        = require('./routes/ocr');
const analyticsRoutes  = require('./routes/analytics');
const settingsRoutes   = require('./routes/settings');
const knowledgeRoutes  = require('./routes/knowledge');
const webhookRoutes    = require('./routes/webhooks');
const crmRoutes        = require('./routes/crm');
const wevisaRoutes     = require('./routes/wevisa');
const wevisaAdminRoutes = require('./routes/wevisaAdmin');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: process.env.FRONTEND_URL || 'http://localhost:5173', methods: ['GET','POST'], credentials: true },
});
app.set('io', io);
socketHandler(io);

app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }));
app.use(morgan('combined', { stream: { write: (msg) => logger.info(msg.trim()) } }));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 500, message: { success: false, message: 'Too many requests.' } });
app.use('/api/', limiter);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/webhooks', webhookRoutes);

// ── VisaAI Pro Admin Routes ──
app.use('/api/auth',      authRoutes);
app.use('/api/leads',     leadRoutes);
app.use('/api/chatbot',   chatbotRoutes);
app.use('/api/voice',     voiceRoutes);
app.use('/api/ocr',       ocrRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/settings',  settingsRoutes);
app.use('/api/knowledge', knowledgeRoutes);
app.use('/api/crm',       crmRoutes);

// ── WeVisa Agent Routes ──
app.use('/api/wevisa', wevisaRoutes);

// ── WeVisa Admin Routes ──
app.use('/api/wevisa-admin', wevisaAdminRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString(), uptime: process.uptime() }));
app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));
app.use((err, req, res, next) => {
  logger.error(`${err.status || 500} — ${err.message}`);
  res.status(err.status || 500).json({ success: false, message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message });
});

const PORT = process.env.PORT || 3001;
async function start() {
  try {
    await connectDB();
    await connectRedis();
    server.listen(PORT, () => {
      logger.info(`🚀 VisaAI+WeVisa Backend running on port ${PORT}`);
    });
  } catch (err) {
    logger.error('Failed to start:', err);
    process.exit(1);
  }
}
start();
module.exports = { app, server, io };
