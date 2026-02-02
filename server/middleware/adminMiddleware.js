module.exports = function(req, res, next) {
  // authMiddleware pehle chal chuka hota hai, isliye req.user available hai
  if (req.user && req.user.role === 'admin') {
    next(); // Agar admin hai, to aage badho
  } else {
    return res.status(403).json({ message: "Access Denied: Admins only" });
  }
};