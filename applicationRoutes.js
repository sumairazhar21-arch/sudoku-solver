const express = require('express');
const router = express.Router();
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');
const {
  createApplication,
  getMyApplications,
  getJobApplications,
  updateApplicationStatus
} = require('../controllers/applicationController');

// POST /api/applications — candidate applies for a job
router.post('/', protect, authorizeRoles('candidate'), upload.fields([
  { name: 'resume', maxCount: 1 },
  { name: 'coverLetter', maxCount: 1 }
]), createApplication);

// GET /api/applications/my — candidate sees their own applications
router.get('/my', protect, authorizeRoles('candidate'), getMyApplications);

// GET /api/applications/job/:jobId — hr sees all applicants for a job
router.get('/job/:jobId', protect, authorizeRoles('hr', 'admin'), getJobApplications);

// PATCH /api/applications/:id/status — hr updates status
router.patch('/:id/status', protect, authorizeRoles('hr', 'admin'), updateApplicationStatus);

module.exports = router;
