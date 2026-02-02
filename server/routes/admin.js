const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware'); // ✅ Security check

// --- GLOBAL MIDDLEWARE ---
// Ye ensure karta hai ki neeche ke sabhi routes sirf Admin access karein
router.use(authMiddleware, adminMiddleware);

// 1. DASHBOARD STATS
router.get('/stats', adminController.getStats);

// 2. USER MANAGEMENT
router.get('/users', adminController.getAllUsers);           
router.delete('/users/:id', adminController.deleteUser);     
router.put('/users/:id/role', adminController.updateUserRole); 

// 3. VERIFICATION QUEUE
router.get('/verify', adminController.getPendingVerifications); 
router.put('/verify/:id', adminController.verifyUser); 

// 4. MANAGE JOBS
router.get('/jobs', adminController.getAllJobs);
router.delete('/jobs/:id', adminController.deleteJob);

// 5. MANAGE EVENTS
router.get('/events', adminController.getAllEvents);
router.delete('/events/:id', adminController.deleteEvent);

// 6. MANAGE CERTIFICATES
router.get('/certificates', adminController.getAllCertificates);
router.delete('/certificates/:id', adminController.deleteCertificate);

// 👇 7. USER ANALYTICS (Ye Naya Route Hai)
router.get('/analytics', adminController.getAnalytics);

module.exports = router;