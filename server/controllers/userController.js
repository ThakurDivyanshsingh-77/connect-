const User = require('../models/User');
const Certificate = require('../models/Certificate');
const bcrypt = require('bcryptjs'); // ✅ Password Hashing ke liye

// 1. GET ALL VERIFIED USERS (NETWORK)
exports.getNetworkUsers = async (req, res) => {
  try {
    const keyword = req.query.search
      ? {
          $or: [
            { name: { $regex: req.query.search, $options: "i" } },
            { company: { $regex: req.query.search, $options: "i" } },
          ],
        }
      : {};

    const users = await User.find({ 
      ...keyword, 
      isVerified: true, 
      role: { $ne: 'admin' }, 
      _id: { $ne: req.user.id } 
    })
    .select('-password'); 

    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// 2. GET LEADERBOARD
exports.getLeaderboard = async (req, res) => {
  try {
    const users = await User.find({ 
        isVerified: true, 
        role: { $ne: 'admin' } 
      })
      .sort({ points: -1 }) 
      .limit(50) 
      .select('name avatar_url points role batch company field_of_study'); 

    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// 3. GET USER BY ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
        return res.status(404).json({ message: "User not found" });
    }
    res.status(500).json({ message: "Server Error" });
  }
};

// 4. UPDATE PROFILE
exports.updateProfile = async (req, res) => {
  try {
    const { name, headline, bio, location, company, designation, website, batch } = req.body;
    
    const updatedUser = await User.findByIdAndUpdate(req.user.id, {
      name, headline, bio, location, company, designation, website, batch
    }, { new: true }).select('-password');

    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// 5. UPLOAD AVATAR
exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const updatedUser = await User.findByIdAndUpdate(req.user.id, {
      avatar_url: req.file.path
    }, { new: true }).select('-password');

    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// 6. UPDATE SKILLS
exports.updateSkills = async (req, res) => {
  try {
    const { skills } = req.body;
    
    const updatedUser = await User.findByIdAndUpdate(req.user.id, {
      skills: skills
    }, { new: true }).select('-password');

    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// --- CERTIFICATE SECTION ---

// 7. ADD CERTIFICATE (+30 POINTS)
exports.addCertificate = async (req, res) => {
  try {
    const { title, category, issuing_organization, issue_date } = req.body;
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({ message: "Certificate file is required" });
    }

    const newCertificate = new Certificate({
      user: userId,
      title,
      category,
      issuing_organization,
      issue_date,
      file_url: req.file.path
    });

    await newCertificate.save();

    // Add 30 Points
    await User.findByIdAndUpdate(userId, { $inc: { points: 30 } });

    res.status(201).json(newCertificate);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// 8. GET CERTIFICATES
exports.getCertificates = async (req, res) => {
  try {
    const targetUserId = req.params.userId || req.user.id;
    
    const certificates = await Certificate.find({ user: targetUserId })
      .sort({ issue_date: -1 });
      
    res.json(certificates);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// 9. DELETE CERTIFICATE (-30 POINTS)
exports.deleteCertificate = async (req, res) => {
  try {
    const certId = req.params.id;
    const certificate = await Certificate.findById(certId);

    if (!certificate) return res.status(404).json({ message: "Certificate not found" });

    if (certificate.user.toString() !== req.user.id) {
      return res.status(401).json({ message: "Not authorized" });
    }

    await certificate.deleteOne();

    // Deduct 30 Points
    await User.findByIdAndUpdate(req.user.id, { $inc: { points: -30 } });

    res.json({ message: "Certificate deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// --- SETTINGS SECTION (NEW) ---

// 10. UPDATE SETTINGS (Notifications/Privacy)
exports.updateSettings = async (req, res) => {
  try {
    const { emailNotifications, profileVisibility } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Initialize settings object if it doesn't exist (safety check)
    if (!user.settings) {
        user.settings = {};
    }

    // Update fields if provided
    if (emailNotifications !== undefined) user.settings.emailNotifications = emailNotifications;
    if (profileVisibility) user.settings.profileVisibility = profileVisibility;

    await user.save();
    res.json(user.settings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// 11. CHANGE PASSWORD
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    const user = await User.findById(req.user.id);
    
    // Check old password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect current password" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    
    await user.save();
    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// --- DASHBOARD STATS SECTION (NEW - FOR PROGRESS BAR) ---

// 12. GET USER STATS (Points & Progress)
exports.getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Fetch User (Connections count ke liye)
    const user = await User.findById(userId);
    
    // 2. Count Certificates
    const certificatesCount = await Certificate.countDocuments({ user: userId });

    // 3. Count Connections (Assuming 'connections' array in User model)
    const connectionsCount = user.connections ? user.connections.length : 0;

    // 4. Calculate Points (Gamification Logic)
    // Formula: 50 pts per Certificate + 10 pts per Connection
    const points = (certificatesCount * 50) + (connectionsCount * 10);

    // 5. Update Points in DB (Syncing if logic changes)
    if(user.points !== points){
        user.points = points;
        await user.save();
    }

    // 6. Calculate Progress to Next Level (e.g., Level up every 100 pts)
    const nextLevelTarget = Math.ceil((points + 1) / 100) * 100;
    const progressPercentage = Math.min((points / nextLevelTarget) * 100, 100);

    res.json({
      points,
      nextLevelTarget,
      progressPercentage,
      stats: {
        certificates: certificatesCount,
        connections: connectionsCount,
        events: 0, // Placeholder
        jobs: 0    // Placeholder
      }
    });

  } catch (error) {
    console.error("Error fetching user stats:", error);
    res.status(500).json({ message: "Server Error" });
  }
};