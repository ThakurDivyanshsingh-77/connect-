require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");

// Routes
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const userRoutes = require("./routes/users");
const connectionRoutes = require("./routes/connections");
const messageRoutes = require("./routes/messages");
const jobRoutes = require("./routes/jobs");
const eventRoutes = require("./routes/events");

const app = express();

// ============================
// 🌐 CORS (FIXED FOR PROD + LOCAL)
// ============================
app.use(
  cors({
    origin: true, // ✅ allow all origins (safe for now)
    credentials: true,
  })
);

// ============================
// 🧠 Middlewares
// ============================
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ============================
// 🗄️ MongoDB Connection
// ============================
const MONGO_URI = process.env.MONGO_URI;
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// ============================
// 🚏 API Routes
// ============================
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);
app.use("/api/connections", connectionRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/events", eventRoutes);

// ============================
// 🧪 Health Check (IMPORTANT)
// ============================
app.get("/", (req, res) => {
  res.send("🚀 Alumni Connect Backend is Running");
});

// ============================
// 🔌 Socket.io Setup (FIXED)
// ============================
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: true, // ✅ allow all
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("🔌 User Connected:", socket.id);

  socket.on("setup", (userData) => {
    if (userData?.id) {
      socket.join(userData.id);
      socket.emit("connected");
      console.log("👤 User joined room:", userData.id);
    }
  });

  socket.on("join chat", (room) => {
    socket.join(room);
  });

  socket.on("new message", (newMessage) => {
    const recipientId = newMessage?.recipient;
    if (recipientId) {
      socket.to(recipientId).emit("message received", newMessage);
    }
  });

  socket.on("disconnect", () => {
    console.log("❌ User Disconnected:", socket.id);
  });
});

// ============================
// 🚀 Start Server (Render Ready)
// ============================
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
