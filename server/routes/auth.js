const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const upload = require('../middleware/upload'); // File upload ke liye
const authMiddleware = require('../middleware/authMiddleware'); // Refresh logic ke liye

// 1. Signup Route (with Image Upload)
router.post('/signup', upload.single('idCard'), authController.signup);

// 2. Login Route
router.post('/login', authController.login);

// 3. Me Route (PERSISTENT LOGIN - Refresh Fix)
// Ye wahi route hai jo debug_server.js mein humne last mein add kiya tha
router.get('/me', authMiddleware, authController.getMe);

module.exports = router;