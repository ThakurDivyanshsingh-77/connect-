require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const http = require('http'); // 1. Import HTTP
const { Server } = require('socket.io'); // 2. Import Socket.io

const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/users');
const connectionRoutes = require('./routes/connections');
const messageRoutes = require('./routes/messages');
const jobRoutes = require('./routes/jobs');
const eventRoutes = require('./routes/events');
const app = express();

// 3. Create HTTP Server
const server = http.createServer(app);

// 4. Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: "http://localhost:8080", // Frontend URL
    methods: ["GET", "POST"]
  }
});

app.use(cors({
  origin: "http://localhost:8080",
  credentials: true
}));

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database Connection
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/alumni_connect";
mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/connections', connectionRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/events', eventRoutes);
// --- 5. SOCKET.IO LOGIC ---
io.on("connection", (socket) => {
  console.log("🔌 User Connected:", socket.id);

  // User joins their own room (Room Name = User ID)
  socket.on("setup", (userData) => {
    socket.join(userData.id);
    console.log("👤 User Joined Room:", userData.id);
    socket.emit("connected");
  });

  // User joins a chat room (Optional, but good for group chats)
  socket.on("join chat", (room) => {
    socket.join(room);
  });

  // Sending Message
  socket.on("new message", (newMessageRecieved) => {
    var chat = newMessageRecieved;
    var recipientId = chat.recipient;

    if (!recipientId) return console.log("Recipient not defined");

    // Send message to the recipient's room
    // Logic: Emit to the room matching the Recipient's User ID
    socket.in(recipientId).emit("message received", newMessageRecieved);
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected");
  });
});

const PORT = process.env.PORT || 5000;
// Change app.listen to server.listen
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});