const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  company: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  type: {
    type: String, // e.g., 'Full-time', 'Internship', 'Remote'
    required: true
  },
  description: {
    type: String,
    required: true
  },
  salaryRange: {
    type: String // e.g., "10LPA - 15LPA"
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // --- UPDATE START ---
  applicants: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['applied', 'shortlisted', 'rejected'], default: 'applied' },
    appliedAt: { type: Date, default: Date.now },
    coverLetter: { type: String } // <--- YE NAYA FIELD HAI
  }],
  // --- UPDATE END ---
  status: {
    type: String,
    enum: ['active', 'closed'],
    default: 'active'
  }
}, { timestamps: true });

module.exports = mongoose.model('Job', jobSchema);