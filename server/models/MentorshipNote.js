const mongoose = require('mongoose');

const mentorshipNoteSchema = new mongoose.Schema(
  {
    mentorship: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Mentorship',
      required: true,
      index: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },
    visibleToMentee: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true }
);

mentorshipNoteSchema.index({ mentorship: 1, createdAt: -1 });

module.exports = mongoose.model('MentorshipNote', mentorshipNoteSchema);

