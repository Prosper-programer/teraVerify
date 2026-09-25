const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

let io;

const initIO = (httpServer) => {
  const allowedOrigins = process.env.CORS_ORIGINS 
    ? process.env.CORS_ORIGINS.split(',') 
    : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:8081', 'exp://localhost:8081'];

  io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      methods: ['GET', 'POST', 'PUT', 'DELETE']
    }
  });

  // Authentication Middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.headers['authorization'];
    
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    try {
      // Remove Bearer if present
      const tokenString = token.startsWith('Bearer ') ? token.slice(7, token.length) : token;
      
      const decoded = jwt.verify(tokenString, process.env.JWT_SECRET || 'supersecret_teraverify_key_2024');
      socket.user = decoded;
      next();
    } catch (err) {
      return next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const user = socket.user;
    console.log(`[Socket] User connected: ${user.id} (${user.role}) [Socket ID: ${socket.id}]`);

    // Join specific user room
    socket.join(`user_${user.id}`);
    
    // Join role-specific room (e.g., role_admin, role_surveyor)
    if (user.role) {
      socket.join(`role_${user.role}`);
    }

    socket.on('disconnect', () => {
      console.log(`[Socket] User disconnected: ${user.id}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io has not been initialized. Please call initIO first.');
  }
  return io;
};

module.exports = {
  initIO,
  getIO
};
