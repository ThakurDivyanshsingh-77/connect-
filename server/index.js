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

/* =======================
   🌐 CORS (FINAL FIX)
======================= */
app.use(
  cors({
    origin: true, // allow Vercel + local
    credentials: true,
  })
);

/* =======================
   🧠 Middlewares
======================= */
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* =======================
   🚏 Routes
======================= */
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);
app.use("/api/connections", connectionRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/events", eventRoutes);

/* =======================
   🧪 Health Check
======================= */
app.get("/", (req, res) => {
  res.send("🚀 Alumni Connect Backend Running");
});

/* =======================
   🗄️ MongoDB
======================= */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

/* =======================
   🔌 Socket.io
======================= */
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: true,
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("🔌 Socket connected:", socket.id);

  socket.on("setup", (userData) => {
    socket.join(userData.id);
    socket.emit("connected");
  });

  socket.on("new message", (msg) => {
    if (msg?.recipient) {
      socket.to(msg.recipient).emit("message received", msg);
    }
  });
});

/* =======================
   🚀 Start Server
======================= */
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
