const Application = require('../models/Application');
const User = require('../models/User');
const Job = require('../models/Job');
const { sendEmail, shortlistEmailTemplate, rejectionEmailTemplate } = require('../utils/sendEmail');

// @desc    Candidate applies for a job
// @route   POST /api/applications
const createApplication = async (req, res) => {
  try {
    const { jobId } = req.body;

    if (!jobId) {
      return res.status(400).json({ message: 'Job ID is required' });
    }

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.status !== 'open') {
      return res.status(400).json({ message: 'This job is no longer accepting applications' });
    }

    // Check if already applied
    const existingApplication = await Application.findOne({
      job: jobId,
      candidate: req.user._id
    });

    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }

    // Get resume URL
    let resumeUrl = '';
    let coverLetterUrl = '';

    if (req.files && req.files.resume && req.files.resume[0]) {
      resumeUrl = req.files.resume[0].path;
    } else if (req.user.resumeUrl) {
      resumeUrl = req.user.resumeUrl;
    } else {
      return res.status(400).json({ message: 'Resume is required. Please upload a resume.' });
    }

    if (req.files && req.files.coverLetter && req.files.coverLetter[0]) {
      coverLetterUrl = req.files.coverLetter[0].path;
    } else if (req.user.coverLetterUrl) {
      coverLetterUrl = req.user.coverLetterUrl;
    }

    const application = await Application.create({
      job: jobId,
      candidate: req.user._id,
      resumeUrl,
      coverLetterUrl,
      status: 'Submitted'
    });

    const populatedApp = await Application.findById(application._id)
      .populate({
        path: 'job',
        populate: { path: 'branch', select: 'name' }
      })
      .populate('candidate', 'name email');

    res.status(201).json(populatedApp);
  } catch (error) {
    console.error('Apply error:', error.message);
    res.status(500).json({ message: 'Server error submitting application', error: error.message });
  }
};

// @desc    Candidate sees their own applications
// @route   GET /api/applications/my
const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ candidate: req.user._id })
      .populate({
        path: 'job',
        populate: { path: 'branch', select: 'name' }
      })
      .sort({ appliedAt: -1 });

    res.status(200).json(applications);
  } catch (error) {
    console.error('Get my applications error:', error.message);
    res.status(500).json({ message: 'Server error fetching applications', error: error.message });
  }
};

// @desc    HR sees all applicants for a job
// @route   GET /api/applications/job/:jobId
const getJobApplications = async (req, res) => {
  try {
    const applications = await Application.find({ job: req.params.jobId })
      .populate('candidate', 'name email phone profilePicture')
      .populate({
        path: 'job',
        populate: { path: 'branch', select: 'name' }
      })
      .sort({ appliedAt: -1 });

    res.status(200).json(applications);
  } catch (error) {
    console.error('Get job applications error:', error.message);
    res.status(500).json({ message: 'Server error fetching applications', error: error.message });
  }
};

// @desc    HR updates status
// @route   PATCH /api/applications/:id/status
const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Submitted', 'Under Review', 'Shortlisted', 'Interview Scheduled', 'Rejected', 'Selected'];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Valid statuses: ' + validStatuses.join(', ') });
    }

    const application = await Application.findById(req.params.id)
      .populate('candidate', 'name email')
      .populate('job', 'title');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    application.status = status;
    await application.save();

    // Send emails on status change
    try {
      if (status === 'Shortlisted') {
        await sendEmail({
          to: application.candidate.email,
          subject: `Congratulations! You've been shortlisted for ${application.job.title}`,
          html: shortlistEmailTemplate(application.candidate.name, application.job.title)
        });
      } else if (status === 'Rejected') {
        await sendEmail({
          to: application.candidate.email,
          subject: `Application Update for ${application.job.title}`,
          html: rejectionEmailTemplate(application.candidate.name, application.job.title)
        });
      }
    } catch (emailError) {
      console.error('Email sending failed (status still updated):', emailError.message);
    }

    res.status(200).json(application);
  } catch (error) {
    console.error('Update status error:', error.message);
    res.status(500).json({ message: 'Server error updating application status', error: error.message });
  }
};

module.exports = {
  createApplication,
  getMyApplications,
  getJobApplications,
  updateApplicationStatus
};
