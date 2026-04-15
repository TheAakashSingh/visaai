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

// Route imports
const authRoutes = require('./routes/auth');
const leadRoutes = require('./routes/leads');
const chatbotRoutes = require('./routes/chatbot');
const voiceRoutes = require('./routes/voice');
const ocrRoutes = require('./routes/ocr');
const analyticsRoutes = require('./routes/analytics');
const settingsRoutes = require('./routes/settings');
const knowledgeRoutes = require('./routes/knowledge');
const webhookRoutes = require('./routes/webhooks');
const crmRoutes = require('./routes/crm');
const wevisaRoutes = require('./routes/wevisa'); // ← WeVisa platform

const app = express();
const server = http.createServer(app);

// Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Attach io to app for use in routes
app.set('io', io);
socketHandler(io);

// ===== MIDDLEWARE =====
app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(morgan('combined', { stream: { write: (msg) => logger.info(msg.trim()) } }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// Body parsers (BEFORE routes)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Webhook routes
app.use('/webhooks', webhookRoutes);

// ===== ROUTES =====
app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/voice', voiceRoutes);
app.use('/api/ocr', ocrRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/knowledge', knowledgeRoutes);
app.use('/api/crm', crmRoutes);
app.use('/api/wevisa', wevisaRoutes); // ← WeVisa B2B Platform

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), uptime: process.uptime(), version: '1.0.0' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  logger.error(`${err.status || 500} — ${err.message} — ${req.originalUrl} — ${req.method}`);
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
});

// ===== START =====
const PORT = process.env.PORT || 3001;

async function start() {
  try {
    await connectDB();
    await connectRedis();
    server.listen(PORT, () => {
      logger.info(`🚀 VisaAI Backend running on port ${PORT}`);
      logger.info(`🔌 Socket.IO ready`);
      logger.info(`🌍 Environment: ${process.env.NODE_ENV}`);
    });
  } catch (err) {
    logger.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();

module.exports = { app, server, io };
