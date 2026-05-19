const Branch = require('../models/Branch');

// @desc    Get all branches (public)
// @route   GET /api/branches
const getBranches = async (req, res) => {
  try {
    const branches = await Branch.find().sort({ createdAt: -1 });
    res.status(200).json(branches);
  } catch (error) {
    console.error('Get branches error:', error.message);
    res.status(500).json({ message: 'Server error fetching branches', error: error.message });
  }
};

// @desc    Create branch
// @route   POST /api/branches
const createBranch = async (req, res) => {
  try {
    const { name, address, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Branch name is required' });
    }

    const branch = await Branch.create({ name, address, description });
    res.status(201).json(branch);
  } catch (error) {
    console.error('Create branch error:', error.message);
    res.status(500).json({ message: 'Server error creating branch', error: error.message });
  }
};

// @desc    Delete branch
// @route   DELETE /api/branches/:id
const deleteBranch = async (req, res) => {
  try {
    const branch = await Branch.findById(req.params.id);

    if (!branch) {
      return res.status(404).json({ message: 'Branch not found' });
    }

    await Branch.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Branch deleted successfully' });
  } catch (error) {
    console.error('Delete branch error:', error.message);
    res.status(500).json({ message: 'Server error deleting branch', error: error.message });
  }
};

module.exports = {
  getBranches,
  createBranch,
  deleteBranch
};
