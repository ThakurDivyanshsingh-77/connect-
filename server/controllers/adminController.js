const User = require('../models/User');
const Job = require('../models/Job');
const Event = require('../models/Event');
const Certificate = require('../models/Certificate');

// 1. GET ADMIN STATS (Dashboard)
exports.getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: { $ne: 'admin' } });
    const pendingVerifications = await User.countDocuments({ verificationStatus: 'pending' });
    const totalJobs = await Job.countDocuments();
    const totalEvents = await Event.countDocuments();

    // Recent 5 Users
    const recentUsers = await User.find({ role: { $ne: 'admin' } })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email role createdAt');

    res.json({
      stats: { totalUsers, pendingVerifications, totalJobs, totalEvents },
      recentUsers
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// 2. GET ALL USERS (User Management)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: 'admin' } }).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// 3. DELETE USER
exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// 4. GET PENDING VERIFICATIONS (Verification Queue)
exports.getPendingVerifications = async (req, res) => {
  try {
    const users = await User.find({ verificationStatus: 'pending' }).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// 5. VERIFY USER (Approve/Reject)
exports.verifyUser = async (req, res) => {
  try {
    const { status } = req.body; // 'approved' or 'rejected'
    const userId = req.params.id; 

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const user = await User.findByIdAndUpdate(
      userId, 
      { 
        verificationStatus: status,
        isVerified: status === 'approved' 
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: `User ${status} successfully`, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// 6. UPDATE USER ROLE
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body; 
    const userId = req.params.id;

    // Note: Roles array ko apni application ke hisab se adjust karein (e.g., 'student', 'alumni')
    const validRoles = ['student', 'alumni', 'admin', 'junior', 'senior', 'teacher'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await User.findByIdAndUpdate(userId, { role }, { new: true }).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// 7. MANAGE JOBS
exports.getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

exports.deleteJob = async (req, res) => {
  try {
    await Job.findByIdAndDelete(req.params.id);
    res.json({ message: "Job deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// 8. MANAGE EVENTS
exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: "Event deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// 9. MANAGE CERTIFICATES
exports.getAllCertificates = async (req, res) => {
  try {
    const certs = await Certificate.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json(certs);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

exports.deleteCertificate = async (req, res) => {
  try {
    await Certificate.findByIdAndDelete(req.params.id);
    res.json({ message: "Certificate deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

/// 👇 UPDATED ANALYTICS FUNCTION (Roles Fixed)
exports.getAnalytics = async (req, res) => {
  try {
    // 1. Total Users Count (Excluding Admin)
    const totalUsers = await User.countDocuments({ role: { $ne: 'admin' } });

    // 2. Count by Role
    // 'student' graph me 'junior' ko count karein
    const studentsCount = await User.countDocuments({ 
        role: { $in: ['student', 'junior'] } 
    });

    // 'alumni' graph me 'senior' ko count karein
    const alumniCount = await User.countDocuments({ 
        role: { $in: ['alumni', 'senior'] } 
    });

    // 3. Verification Status (Sirf Seniors/Alumni ke liye)
    const verifiedAlumni = await User.countDocuments({ 
        role: { $in: ['alumni', 'senior'] }, 
        isVerified: true 
    });
    
    const pendingAlumni = await User.countDocuments({ 
        role: { $in: ['alumni', 'senior'] }, 
        isVerified: false 
    });

    // 4. Recent Users for Table
    const recentUsers = await User.find({ role: { $ne: 'admin' } })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email role createdAt');

    res.json({
      totalUsers,
      studentsCount,
      alumniCount,
      verifiedAlumni,
      pendingAlumni,
      recentUsers
    });

  } catch (error) {
    console.error("Analytics Error:", error);
    res.status(500).json({ message: "Server Error fetching analytics" });
  }
};