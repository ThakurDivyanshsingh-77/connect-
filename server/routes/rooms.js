const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, roomController.createRoom);
router.get('/', authMiddleware, roomController.getRooms);
router.get('/:id', authMiddleware, roomController.getRoomDetails);
router.post('/:id/join', authMiddleware, roomController.joinRoom);
router.post('/:id/leave', authMiddleware, roomController.leaveRoom);
router.post('/:id/invite', authMiddleware, roomController.inviteToRoom);
router.delete('/:id', authMiddleware, roomController.deleteRoom);

module.exports = router;
