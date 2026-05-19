const Interview = require('../models/Interview');
const Application = require('../models/Application');
const { sendEmail, interviewEmailTemplate } = require('../utils/sendEmail');

// @desc    HR schedules interview
// @route   POST /api/interviews
const scheduleInterview = async (req, res) => {
  try {
    const { applicationId, date, time, message } = req.body;

    if (!applicationId || !date || !time) {
      return res.status(400).json({ message: 'Application ID, date, and time are required' });
    }

    const application = await Application.findById(applicationId)
      .populate('candidate', 'name email')
      .populate('job', 'title');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const interview = await Interview.create({
      application: applicationId,
      candidate: application.candidate._id,
      job: application.job._id,
      date,
      time,
      message: message || ''
    });

    // Update application status
    application.status = 'Interview Scheduled';
    await application.save();

    // Send interview invitation email
    try {
      await sendEmail({
        to: application.candidate.email,
        subject: `Interview Invitation for ${application.job.title}`,
        html: interviewEmailTemplate(
          application.candidate.name,
          application.job.title,
          date,
          time,
          message
        )
      });
    } catch (emailError) {
      console.error('Interview email failed (interview still created):', emailError.message);
    }

    const populatedInterview = await Interview.findById(interview._id)
      .populate('candidate', 'name email phone')
      .populate('job', 'title department')
      .populate('application', 'status');

    res.status(201).json(populatedInterview);
  } catch (error) {
    console.error('Schedule interview error:', error.message);
    res.status(500).json({ message: 'Server error scheduling interview', error: error.message });
  }
};

// @desc    Candidate sees their interviews
// @route   GET /api/interviews/my
const getMyInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find({ candidate: req.user._id })
      .populate('job', 'title department')
      .populate('application', 'status')
      .sort({ createdAt: -1 });

    res.status(200).json(interviews);
  } catch (error) {
    console.error('Get my interviews error:', error.message);
    res.status(500).json({ message: 'Server error fetching interviews', error: error.message });
  }
};

// @desc    HR sees all interviews
// @route   GET /api/interviews
const getAllInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find()
      .populate('candidate', 'name email phone')
      .populate('job', 'title department')
      .populate('application', 'status')
      .sort({ createdAt: -1 });

    res.status(200).json(interviews);
  } catch (error) {
    console.error('Get all interviews error:', error.message);
    res.status(500).json({ message: 'Server error fetching interviews', error: error.message });
  }
};

module.exports = {
  scheduleInterview,
  getMyInterviews,
  getAllInterviews
};
