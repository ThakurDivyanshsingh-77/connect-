const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['academic', 'professional', 'technical', 'workshop', 'other'],
    default: 'other'
  },
  issuing_organization: {
    type: String,
    required: true
  },
  issue_date: {
    type: Date,
    required: true
  },
  file_url: {
    type: String, // File path ya URL store karega
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Certificate', certificateSchema);