const Application = require('../models/Application');
const User = require('../models/User');
const { sendEmail, customEmailTemplate } = require('../utils/sendEmail');

// @desc    Get all applications with candidate and job info populated
// @route   GET /api/hr/applicants
const getAllApplicants = async (req, res) => {
  try {
    const applications = await Application.find()
      .populate('candidate', 'name email phone profilePicture')
      .populate({
        path: 'job',
        populate: { path: 'branch', select: 'name' }
      })
      .sort({ appliedAt: -1 });

    res.status(200).json(applications);
  } catch (error) {
    console.error('Get all applicants error:', error.message);
    res.status(500).json({ message: 'Server error fetching applicants', error: error.message });
  }
};

// @desc    Send custom email to a candidate
// @route   POST /api/hr/message
const sendCustomMessage = async (req, res) => {
  try {
    const { candidateId, subject, message } = req.body;

    if (!candidateId || !subject || !message) {
      return res.status(400).json({ message: 'Candidate ID, subject, and message are required' });
    }

    const candidate = await User.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    await sendEmail({
      to: candidate.email,
      subject,
      html: customEmailTemplate(candidate.name, message)
    });

    res.status(200).json({ message: 'Email sent successfully to ' + candidate.email });
  } catch (error) {
    console.error('Send message error:', error.message);
    res.status(500).json({ message: 'Server error sending email', error: error.message });
  }
};

module.exports = {
  getAllApplicants,
  sendCustomMessage
};
