const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const authMiddleware = require('../middleware/authMiddleware');

// 👇 Try importing both possible names (Debug logic)
let upload;
try {
    upload = require('../middleware/uploadMiddleware');
    console.log("✅ SUCCESS: 'uploadMiddleware.js' found and loaded.");
} catch (e) {
    try {
        upload = require('../middleware/upload');
        console.log("✅ SUCCESS: 'upload.js' found and loaded.");
    } catch (e2) {
        console.error("❌ CRITICAL ERROR: Upload middleware file NOT found in 'server/middleware/'");
    }
}

console.log("🚀 Message Routes Loading..."); // Ye Terminal me dikhna chahiye

// 1. Upload Route
router.post('/upload', authMiddleware, (req, res, next) => {
    console.log("📨 Upload Route HIT by Frontend!"); // Ye Upload karte waqt dikhna chahiye
    if (!upload) {
        return res.status(500).json({ message: "Upload middleware missing on server" });
    }
    next();
}, upload.single('file'), (req, res) => {
    console.log("📂 Multer processed the file...");
    if (!req.file) {
        console.log("⚠️ No file in request");
        return res.status(400).json({ message: "No file uploaded" });
    }
    const filePath = req.file.path.replace(/\\/g, "/");
    console.log("✅ File saved at:", filePath);
    res.json({ url: filePath, public_id: req.file.filename, type: req.file.mimetype });
});

// 2. Send Message
router.post('/', authMiddleware, messageController.sendMessage);

// 3. Conversations
router.get('/conversations', authMiddleware, messageController.getConversations);

// 4. History
router.get('/:userId', authMiddleware, messageController.getMessages);

// 5. Room Messages
router.get('/room/:roomId', authMiddleware, messageController.getRoomMessages);
router.post('/room/:roomId', authMiddleware, messageController.sendRoomMessage);

// 6. Message Actions (Reactions & Pins)
router.put('/:messageId/pin', authMiddleware, messageController.togglePinMessage);
router.put('/:messageId/react', authMiddleware, messageController.toggleReaction);

module.exports = router;