const express = require('express');
const router = express.Router();
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const {
  getJobs,
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob
} = require('../controllers/jobController');

// GET /api/jobs — get all open jobs (public), supports ?branch=&department= filters
router.get('/', getJobs);

// GET /api/jobs/all — get all jobs including closed (hr/admin)
router.get('/all', protect, authorizeRoles('hr', 'admin'), getAllJobs);

// GET /api/jobs/:id — get single job (public)
router.get('/:id', getJobById);

// POST /api/jobs — create job (hr/admin)
router.post('/', protect, authorizeRoles('hr', 'admin'), createJob);

// PUT /api/jobs/:id — update job (hr/admin)
router.put('/:id', protect, authorizeRoles('hr', 'admin'), updateJob);

// DELETE /api/jobs/:id — delete job (hr/admin)
router.delete('/:id', protect, authorizeRoles('hr', 'admin'), deleteJob);

module.exports = router;
