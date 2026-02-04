require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

// Route Imports
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/users');
const connectionRoutes = require('./routes/connections');
const messageRoutes = require('./routes/messages');
const jobRoutes = require('./routes/jobs');
const eventRoutes = require('./routes/events');

const app = express();
const server = http.createServer(app);

// --- CONFIGURATION ---

// Update this list with your actual frontend URLs (Local + Production)
const allowedOrigins = [
  "http://localhost:8080", 
  "http://localhost:5173", 
  "https://your-frontend-link.onrender.com" // Replace with your actual frontend URL
];

// Socket.io Initialization
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- DATABASE CONNECTION ---
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://rajsingh71143_db_user:attendance123@cluster0.opzmrwd.mongodb.net/alumni_portal?appName=Cluster0";

mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// --- ROUTES ---
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/connections', connectionRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/events', eventRoutes);

// --- SOCKET.IO LOGIC ---
io.on("connection", (socket) => {
  console.log("🔌 User Connected:", socket.id);

  socket.on("setup", (userData) => {
    if (userData && userData.id) {
      socket.join(userData.id);
      console.log("👤 User Joined Room:", userData.id);
      socket.emit("connected");
    }
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("💬 User Joined Chat Room:", room);
  });

  socket.on("new message", (newMessageRecieved) => {
    const recipientId = newMessageRecieved.recipient;

    if (!recipientId) return console.log("Recipient not defined");

    // Emit to the recipient's specific room (their User ID)
    socket.in(recipientId).emit("message received", newMessageRecieved);
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected");
  });
});

// --- SERVER START ---
// Render provides the PORT via environment variables
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});