const express = require('express');
const router = express.Router();
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const { scheduleInterview, getMyInterviews, getAllInterviews } = require('../controllers/interviewController');

// POST /api/interviews — hr schedules interview
router.post('/', protect, authorizeRoles('hr', 'admin'), scheduleInterview);

// GET /api/interviews/my — candidate sees their interviews
router.get('/my', protect, authorizeRoles('candidate'), getMyInterviews);

// GET /api/interviews — hr sees all interviews
router.get('/', protect, authorizeRoles('hr', 'admin'), getAllInterviews);

module.exports = router;
