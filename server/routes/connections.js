const express = require('express');
const router = express.Router();
const connectionController = require('../controllers/connectionController');
const authMiddleware = require('../middleware/authMiddleware'); // लॉगिन चेक करने के लिए

// 1. Request भेजना (POST /api/connections/request)
router.post('/request', authMiddleware, connectionController.sendRequest);

// 2. अपने कनेक्शन्स देखना (GET /api/connections)
router.get('/', authMiddleware, connectionController.getMyConnections);

// 3. Accept/Reject करना (POST /api/connections/respond)
router.post('/respond', authMiddleware, connectionController.updateStatus);

module.exports = router;