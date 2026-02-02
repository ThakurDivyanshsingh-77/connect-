const Job = require('../models/Job');
const User = require('../models/User'); // 1. User Model Import kiya (Points ke liye)

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
      postedBy: req.user.id
    });

    await newJob.save();

    // 👇 ADD 100 POINTS LOGIC (Job Poster) 👇
    await User.findByIdAndUpdate(req.user.id, { $inc: { points: 100 } });

    res.status(201).json(newJob);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
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
    res.status(500).json({ message: "Server Error" });
  }
};

// 3. Apply for a Job (With Points)
exports.applyForJob = async (req, res) => {
  try {
    const jobId = req.params.id;
    const userId = req.user.id;
    
    // Receive Cover Letter from Frontend
    const { coverLetter } = req.body; 

    // Optional: Restrict Teachers
    if (req.user.role === 'teacher') {
       return res.status(403).json({ message: "Teachers cannot apply for jobs." });
    }

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });

    // Check if already applied
    const alreadyApplied = job.applicants.find(app => app.user.toString() === userId);
    if (alreadyApplied) {
      return res.status(400).json({ message: "You have already applied for this job" });
    }

    // Save User + Cover Letter
    job.applicants.push({ 
      user: userId, 
      coverLetter: coverLetter 
    });
    
    await job.save();

    // 👇 ADD 20 POINTS LOGIC (Applicant) 👇
    await User.findByIdAndUpdate(userId, { $inc: { points: 20 } });

    res.json({ message: "Applied successfully (+20 Points)" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// 4. Delete Job
exports.deleteJob = async (req, res) => {
  try {
    const jobId = req.params.id;
    
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });

    // Security Check: Only owner can delete
    if (job.postedBy.toString() !== req.user.id) {
      return res.status(401).json({ message: "Not authorized to delete this job" });
    }

    await job.deleteOne(); 
    
    res.json({ message: "Job deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// 5. Get Applicants
exports.getJobApplicants = async (req, res) => {
  try {
    const jobId = req.params.id;
    const userId = req.user.id;

    const job = await Job.findById(jobId).populate({
      path: 'applicants.user',
      select: 'name email avatar_url batch'
    });

    if (!job) return res.status(404).json({ message: "Job not found" });

    // Security Check: Sirf Owner dekh sakta hai
    if (job.postedBy.toString() !== userId) {
      return res.status(401).json({ message: "Not authorized" });
    }

    res.json(job.applicants);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};