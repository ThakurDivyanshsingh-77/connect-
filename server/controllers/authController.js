const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Secret Key
const JWT_SECRET = process.env.JWT_SECRET || "alumni_secret_key_123";

// --- SIGNUP FUNCTION ---
exports.signup = async (req, res) => {
  try {
    const { name, email, password, role, batch, company } = req.body;

    // 1. Check agar user pehle se hai
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists!" });
    }

    // 2. ID Card Handling (Multer se aayega)
    let idCardUrl = null;
    if (req.file) {
      idCardUrl = req.file.path; // File ka path save kar rahe hain
    }

    // 3. Verification Logic
    let verificationStatus = 'pending';
    let isVerified = false;

    if (role === 'senior') {
      // Seniors are verified automatically
      verificationStatus = 'approved';
      isVerified = true;
    } else if (role === 'junior' || role === 'teacher') {
      // Juniors/Teachers must upload ID card
      if (!idCardUrl) {
        return res.status(400).json({ message: "ID Card is required for verification" });
      }
      verificationStatus = 'pending';
      isVerified = false;
    }

    // 4. Password Encryption
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5. Create User in Database
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      batch,
      company,
      idCardUrl, // File path saved
      verificationStatus,
      isVerified
    });

    // 6. Generate Token
    const token = jwt.sign({ id: newUser._id, role: newUser.role }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ 
      message: "Registration Successful!", 
      user: {
        id: newUser._id,
        name: newUser.name,
        role: newUser.role,
        isVerified: newUser.isVerified
      },
      token 
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// --- LOGIN FUNCTION ---
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. User dhoondo
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 2. Password match karo
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // 3. Token Generate karo
    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      JWT_SECRET, 
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: "Login Successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      }
    });

  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// --- GET CURRENT USER (For Page Refresh) ---
exports.getMe = async (req, res) => {
  try {
    // req.user.id humein middleware se mila hai
    const user = await User.findById(req.user.id).select('-password'); // Password mat bhejo
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};