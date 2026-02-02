const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/upload'); // ✅ File Upload Middleware

// 1. Get Leaderboard (Top 50 Users)
router.get('/leaderboard', authMiddleware, userController.getLeaderboard);

// --- DASHBOARD STATS (NEW - For Progress Bar) ---
// Note: Isse '/:id' se pehle rakhna zaroori hai
router.get('/stats', authMiddleware, userController.getUserStats); // 👈 NEW ROUTE

// 2. Get All Network Users (Search & Filter)
router.get('/', authMiddleware, userController.getNetworkUsers);

// --- PROFILE UPDATE ROUTES ---
router.put('/profile', authMiddleware, userController.updateProfile);
router.put('/avatar', authMiddleware, upload.single('image'), userController.uploadAvatar);
router.put('/skills', authMiddleware, userController.updateSkills);

// --- SETTINGS & SECURITY ROUTES (NEW) ---
router.put('/settings', authMiddleware, userController.updateSettings);
router.put('/change-password', authMiddleware, userController.changePassword);

// --- CERTIFICATE ROUTES ---
// Add Certificate (+30 Points)
router.post('/certificates', authMiddleware, upload.single('file'), userController.addCertificate);

// Get My Certificates
router.get('/certificates', authMiddleware, userController.getCertificates);

// Get Specific User's Certificates (Public Profile)
router.get('/certificates/:userId', authMiddleware, userController.getCertificates);

// Delete Certificate (-30 Points)
router.delete('/certificates/:id', authMiddleware, userController.deleteCertificate);

// --- SINGLE USER (MUST BE LAST) ---
// Note: Isse sabse neeche rakhein taaki ye upar wale kisi route (jaise /settings ya /stats) ko block na kare
router.get('/:id', authMiddleware, userController.getUserById);

module.exports = router;