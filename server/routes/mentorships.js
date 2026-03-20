const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const mentorshipController = require('../controllers/mentorshipController');

router.use(authMiddleware);

// Junior
router.post('/request', mentorshipController.requestMentorship);
router.get('/my', mentorshipController.getMyMentorship);

// Teacher
router.get('/requests', mentorshipController.getRequests);
router.post('/respond', mentorshipController.respondToRequest);
router.get('/mentees', mentorshipController.getMentees);
router.get('/:mentorshipId', mentorshipController.getMentorshipOverview);

router.post('/:mentorshipId/sessions', mentorshipController.createSession);
router.get('/:mentorshipId/sessions', mentorshipController.getSessions);

router.post('/:mentorshipId/notes', mentorshipController.createNote);
router.get('/:mentorshipId/notes', mentorshipController.getNotes);

router.get('/:mentorshipId/progress', mentorshipController.getProgress);
router.put('/:mentorshipId/progress', mentorshipController.updateProgress);

module.exports = router;

