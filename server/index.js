require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/users');
const connectionRoutes = require('./routes/connections');
const messageRoutes = require('./routes/messages');
const notificationRoutes = require('./routes/notifications');
const mentorshipRoutes = require('./routes/mentorships');
const jobRoutes = require('./routes/jobs');
const eventRoutes = require('./routes/events');
const roomRoutes = require('./routes/rooms');
const { processEventReminders } = require('./utils/notificationService');

const app = express();
const server = http.createServer(app);

const defaultOrigins = ['http://localhost:8080', 'http://127.0.0.1:8080'];
const envOrigins = (process.env.FRONTEND_URLS || process.env.FRONTEND_URL || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowedOrigins = envOrigins.length ? envOrigins : defaultOrigins;

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
};

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

app.set('io', io);
app.use(cors(corsOptions));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/alumni_connect';

mongoose
  .connect(MONGO_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.error('MongoDB connection error:', err));

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/connections', connectionRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/mentorships', mentorshipRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/rooms', roomRoutes);

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('setup', (userData) => {
    const roomId = userData?.id || userData?._id;
    if (!roomId) return;

    socket.join(roomId);
    console.log('User joined room:', roomId);
    socket.emit('connected');
  });

  socket.on('join chat', (room) => {
    socket.join(room);
  });

  socket.on('new message', (newMessageReceived) => {
    const recipientId = typeof newMessageReceived?.recipient === 'object'
      ? newMessageReceived.recipient?._id
      : newMessageReceived?.recipient;

    if (!recipientId) {
      console.log('Recipient not defined');
      return;
    }

    socket.in(recipientId).emit('message received', newMessageReceived);
  });

  // 👇 Community Rooms Chat Events 👇
  socket.on('joinRoom', (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);
  });

  socket.on('leaveRoom', (roomId) => {
    socket.leave(roomId);
    console.log(`User ${socket.id} left room ${roomId}`);
  });

  socket.on('sendMessage', (messageData) => {
    const { roomId } = messageData;
    if (roomId) {
      socket.in(roomId).emit('receiveMessage', messageData);
    }
  });

  socket.on('typing', (data) => {
    const { roomId, userId, isTyping } = data;
    if (roomId) {
      socket.in(roomId).emit('typing', { userId, isTyping });
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Allowed frontend origins: ${allowedOrigins.join(', ')}`);
});

const reminderIntervalMs = Number(process.env.EVENT_REMINDER_INTERVAL_MS || 60000);

setInterval(() => {
  processEventReminders(io).catch((error) => {
    console.error('Event reminder processing error:', error);
  });
}, reminderIntervalMs).unref();

processEventReminders(io).catch((error) => {
  console.error('Initial event reminder processing error:', error);
});
