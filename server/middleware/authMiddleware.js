const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  // 1. Header se token nikalo ("Bearer <token>")
  const token = req.header('Authorization')?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    // 2. Token verify karo
    // "alumni_secret_key_123" wahi secret key hai jo authController mein use ki thi
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "alumni_secret_key_123");
    
    // 3. User ID request mein add karo
    req.user = decoded; 
    next(); // Aage badho
  } catch (error) {
    res.status(401).json({ message: "Token is not valid" });
  }
};