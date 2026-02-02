require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// --- APP SETUP ---
const app = express();
app.use(express.json());

// CORS: Frontend ko permission do
app.use(cors({
  origin: "http://localhost:8080",
  credentials: true
}));

// --- DATABASE CONNECTION ---
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/alumni_connect";
mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected (Debug Server)"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// --- USER MODEL ---
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'junior' },
  isVerified: { type: Boolean, default: false }
});
const User = mongoose.models.User || mongoose.model('User', userSchema);

// --- MIDDLEWARE (Token Checker) ---
const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization')?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token, authorization denied" });
  
    try {
      const decoded = jwt.verify(token, "secret123");
      req.user = decoded; 
      next();
    } catch (error) {
      res.status(401).json({ message: "Token is not valid" });
    }
};

// --- ROUTES ---

// 1. Test Route
app.get('/', (req, res) => {
  res.send("Debug Server is Working! 🚀");
});

// 2. Login Route
app.post('/api/auth/login', async (req, res) => {
  console.log("👉 Login Request Aayi:", req.body.email);

  try {
    const { email, password } = req.body;
    
    // User dhundo
    const user = await User.findOne({ email });
    if (!user) {
      console.log("❌ User database mein nahi mila");
      return res.status(404).json({ message: "User not found." });
    }

    // Password check
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("❌ Password galat hai");
      return res.status(400).json({ message: "Invalid password" });
    }

    console.log("✅ Login Success!");
    
    // Token generate
    const token = jwt.sign(
        { id: user._id, role: user.role }, 
        "secret123", 
        { expiresIn: '7d' }
    );

    res.json({
        message: "Login Successful",
        token,
        user: { name: user.name, email: user.email, role: user.role }
    });

  } catch (error) {
    console.error("🔥 Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// 3. ME ROUTE (Ye missing tha - Refresh Fix!) 🛠️
app.get('/api/auth/me', authMiddleware, async (req, res) => {
    try {
      const user = await User.findById(req.user.id).select('-password');
      if (!user) return res.status(404).json({ message: "User not found" });
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Server Error" });
    }
});

// --- SERVER START ---
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🛠️ Debug Server running on http://localhost:${PORT}`);
  console.log(`👉 API Ready: /api/auth/login & /api/auth/me`);
});