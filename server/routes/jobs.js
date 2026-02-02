const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const authMiddleware = require('../middleware/authMiddleware');

// Create Job (POST /api/jobs)
router.post('/', authMiddleware, jobController.postJob);

// Get All Jobs (GET /api/jobs)
router.get('/', authMiddleware, jobController.getAllJobs);
router.delete('/:id', authMiddleware, jobController.deleteJob);
// Apply for Job (POST /api/jobs/:id/apply)
router.post('/:id/apply', authMiddleware, jobController.applyForJob);
// Get Applicants (GET /api/jobs/:id/applicants)
router.get('/:id/applicants', authMiddleware, jobController.getJobApplicants);
module.exports = router;