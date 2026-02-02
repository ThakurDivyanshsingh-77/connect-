const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/upload'); 

// 1. Create Event
router.post('/', authMiddleware, upload.single('image'), eventController.createEvent);

// 2. Get All Events
router.get('/', authMiddleware, eventController.getAllEvents);

// 3. Register for Event
router.post('/:id/register', authMiddleware, eventController.registerForEvent);

// 4. Unregister
router.delete('/:id/register', authMiddleware, eventController.unregisterForEvent);

// 5. Get Event Attendees (NEW - View List ke liye) 👇
router.get('/:id/attendees', authMiddleware, eventController.getEventAttendees);

// 6. Delete Event
router.delete('/:id', authMiddleware, eventController.deleteEvent);

module.exports = router;