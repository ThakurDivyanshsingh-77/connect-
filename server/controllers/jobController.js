const Job = require('../models/Job');
const User = require('../models/User');
const { createNotification } = require('../utils/notificationService');

// 1. Post a new Job (Only Seniors/Alumni/Admin)
exports.postJob = async (req, res) => {
  try {
    const { title, company, location, type, description, salaryRange } = req.body;

    const newJob = new Job({
      title,
      company,
      location,
      type,
      description,
      salaryRange,
      postedBy: req.user.id,
    });

    await newJob.save();
    await User.findByIdAndUpdate(req.user.id, { $inc: { points: 100 } });

    res.status(201).json(newJob);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// 2. Get All Jobs (With Filters)
exports.getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ status: 'active' })
      .populate('postedBy', 'name avatar_url company designation')
      .sort({ createdAt: -1 });

    res.json(jobs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// 3. Apply for a Job (With Points)
exports.applyForJob = async (req, res) => {
  try {
    const jobId = req.params.id;
    const userId = req.user.id;
    const { coverLetter } = req.body;

    if (req.user.role === 'teacher') {
      return res.status(403).json({ message: 'Teachers cannot apply for jobs.' });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const alreadyApplied = job.applicants.find((app) => app.user.toString() === userId);
    if (alreadyApplied) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }

    job.applicants.push({
      user: userId,
      coverLetter,
    });

    await job.save();
    await User.findByIdAndUpdate(userId, { $inc: { points: 20 } });

    const applicant = await User.findById(userId).select('name');
    await createNotification({
      io: req.app.get('io'),
      recipient: job.postedBy,
      sender: userId,
      type: 'job_update',
      title: 'New job applicant',
      message: `${applicant?.name || 'A user'} applied for ${job.title}.`,
      link: '/jobs',
      metadata: {
        jobId: job._id.toString(),
        applicantId: userId,
      },
    });

    res.json({ message: 'Applied successfully (+20 Points)' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// 4. Delete Job
exports.deleteJob = async (req, res) => {
  try {
    const jobId = req.params.id;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.postedBy.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to delete this job' });
    }

    await job.deleteOne();
    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// 5. Get Applicants
exports.getJobApplicants = async (req, res) => {
  try {
    const jobId = req.params.id;
    const userId = req.user.id;

    const job = await Job.findById(jobId).populate({
      path: 'applicants.user',
      select: 'name email avatar_url batch',
    });

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.postedBy.toString() !== userId) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    res.json(job.applicants);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};
