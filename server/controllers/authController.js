const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || "alumni_secret_key_123";

/* =====================================================
   SIGNUP CONTROLLER
===================================================== */
exports.signup = async (req, res) => {
  try {
    const { name, email, password, role, batch, company } = req.body;

    // 1️⃣ Basic validation
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        message: "Name, email, password and role are required",
      });
    }

    // 2️⃣ Check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    // 3️⃣ Handle ID card upload (multer)
    let idCardUrl = null;
    if (req.file) {
      idCardUrl = req.file.path; // uploads/filename.ext
    }

    // 4️⃣ Verification logic
    let verificationStatus = "pending";
    let isVerified = false;

    if (role === "senior") {
      verificationStatus = "approved";
      isVerified = true;
    }

    if ((role === "junior" || role === "teacher") && !idCardUrl) {
      return res.status(400).json({
        message: "ID Card is required for Junior and Teacher",
      });
    }

    // 5️⃣ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 6️⃣ Create user
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      batch: batch || null,
      company: company || null,
      idCardUrl,
      verificationStatus,
      isVerified,
    });

    // 7️⃣ Generate JWT
    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 8️⃣ Response
    return res.status(201).json({
      message: "Registration successful",
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        isVerified: newUser.isVerified,
      },
    });
  } catch (error) {
    console.error("SIGNUP ERROR:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

/* =====================================================
   LOGIN CONTROLLER
===================================================== */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1️⃣ Validate
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    // 2️⃣ Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // 3️⃣ Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    // 4️⃣ Generate token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 5️⃣ Response
    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

/* =====================================================
   GET CURRENT USER (REFRESH / PERSIST LOGIN)
===================================================== */
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error("GET ME ERROR:", error);
    return res.status(500).json({
      message: "Server error",
    });
  }
};
