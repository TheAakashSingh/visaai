const logger = require('../utils/logger');

const socketHandler = (io) => {
  // Store io globally for controllers to use
  global.io = io;

  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id}`);

    // Join room based on user/org
    socket.on('join', ({ userId, orgId }) => {
      if (userId) socket.join(`user:${userId}`);
      if (orgId) socket.join(`org:${orgId}`);
      logger.info(`Socket ${socket.id} joined rooms: user:${userId}, org:${orgId}`);
    });

    // Subscribe to specific lead updates
    socket.on('subscribe:lead', ({ leadId }) => {
      socket.join(`lead:${leadId}`);
    });

    // Agent availability
    socket.on('agent:available', ({ userId }) => {
      socket.broadcast.emit('agent:status', { userId, status: 'available' });
    });

    // Typing indicator for chat
    socket.on('chat:typing', ({ conversationId, isTyping }) => {
      socket.to(`conv:${conversationId}`).emit('chat:typing', { isTyping });
    });

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id}`);
    });
  });

  // Helper emitters (called from controllers)
  io.emitNewLead = (lead) => io.emit('lead:new', lead);
  io.emitLeadUpdate = (lead) => io.emit('lead:updated', lead);
  io.emitCallUpdate = (call) => io.emit('call:updated', call);
  io.emitNewMessage = (message) => io.emit('message:new', message);
  io.emitOCRComplete = (doc) => io.emit('ocr:complete', doc);
  io.emitSystemAlert = (alert) => io.emit('system:alert', alert);

  return io;
};

module.exports = { socketHandler };
