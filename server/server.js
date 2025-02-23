// server.js

const app = require('./app');
const http = require('http');
const socketIO = require('socket.io');
const socketHandlers = require('./socket/socketHandlers');
const socketAuthMiddleware = require('./middleware/socketMiddleware');

const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO with CORS settings
const io = socketIO(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
  },
  transports: ['polling', 'websocket'],
  path: '/socket.io/',
  pingTimeout: 60000,
  pingInterval: 25000,
  upgradeTimeout: 30000,
  allowUpgrades: true,
  cookie: false
});

// Apply socket authentication middleware
io.use(socketAuthMiddleware);

// Initialize socket handlers
socketHandlers(io);

// Store io instance on app for use in routes
app.set('io', io);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Socket.IO server running with CORS origin: ${process.env.CORS_ORIGIN || 'http://localhost:3000'}`);
});

module.exports = { app, io, server };
