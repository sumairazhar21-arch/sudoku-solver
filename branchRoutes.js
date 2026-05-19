const express = require('express');
const router = express.Router();
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const { getBranches, createBranch, deleteBranch } = require('../controllers/branchController');

// GET /api/branches — get all branches (public)
router.get('/', getBranches);

// POST /api/branches — create branch (hr/admin only)
router.post('/', protect, authorizeRoles('hr', 'admin'), createBranch);

// DELETE /api/branches/:id — delete branch (hr/admin only)
router.delete('/:id', protect, authorizeRoles('hr', 'admin'), deleteBranch);

module.exports = router;
