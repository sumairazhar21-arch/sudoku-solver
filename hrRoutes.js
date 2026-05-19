const express = require('express');
const router = express.Router();
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const { getAllApplicants, sendCustomMessage } = require('../controllers/hrController');

// GET /api/hr/applicants — get all applications with candidate and job info populated
router.get('/applicants', protect, authorizeRoles('hr', 'admin'), getAllApplicants);

// POST /api/hr/message — send custom email to a candidate
router.post('/message', protect, authorizeRoles('hr', 'admin'), sendCustomMessage);

module.exports = router;
