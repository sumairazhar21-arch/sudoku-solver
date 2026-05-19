const Job = require('../models/Job');

// @desc    Get all open jobs (public), supports ?branch=&department= filters
// @route   GET /api/jobs
const getJobs = async (req, res) => {
  try {
    const filter = { status: 'open' };

    if (req.query.branch) {
      filter.branch = req.query.branch;
    }
    if (req.query.department) {
      filter.department = { $regex: req.query.department, $options: 'i' };
    }

    const jobs = await Job.find(filter)
      .populate('branch', 'name address')
      .populate('postedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json(jobs);
  } catch (error) {
    console.error('Get jobs error:', error.message);
    res.status(500).json({ message: 'Server error fetching jobs', error: error.message });
  }
};

// @desc    Get all jobs including closed (hr/admin)
// @route   GET /api/jobs/all
const getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find()
      .populate('branch', 'name address')
      .populate('postedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json(jobs);
  } catch (error) {
    console.error('Get all jobs error:', error.message);
    res.status(500).json({ message: 'Server error fetching all jobs', error: error.message });
  }
};

// @desc    Get single job (public)
// @route   GET /api/jobs/:id
const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('branch', 'name address description')
      .populate('postedBy', 'name email');

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.status(200).json(job);
  } catch (error) {
    console.error('Get job error:', error.message);
    res.status(500).json({ message: 'Server error fetching job', error: error.message });
  }
};

// @desc    Create job (hr/admin)
// @route   POST /api/jobs
const createJob = async (req, res) => {
  try {
    const { title, description, department, branch, requirements, seats } = req.body;

    if (!title || !description || !department || !branch || !seats) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const job = await Job.create({
      title,
      description,
      department,
      branch,
      requirements,
      seats,
      postedBy: req.user._id
    });

    const populatedJob = await Job.findById(job._id)
      .populate('branch', 'name address')
      .populate('postedBy', 'name email');

    res.status(201).json(populatedJob);
  } catch (error) {
    console.error('Create job error:', error.message);
    res.status(500).json({ message: 'Server error creating job', error: error.message });
  }
};

// @desc    Update job (hr/admin)
// @route   PUT /api/jobs/:id
const updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const updatedJob = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('branch', 'name address')
      .populate('postedBy', 'name email');

    res.status(200).json(updatedJob);
  } catch (error) {
    console.error('Update job error:', error.message);
    res.status(500).json({ message: 'Server error updating job', error: error.message });
  }
};

// @desc    Delete job (hr/admin)
// @route   DELETE /api/jobs/:id
const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    await Job.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Delete job error:', error.message);
    res.status(500).json({ message: 'Server error deleting job', error: error.message });
  }
};

module.exports = {
  getJobs,
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob
};
