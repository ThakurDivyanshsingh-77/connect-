const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    // required: true 👈 Yeh hata diya, taaki empty message (sirf file) allow ho
  },
  
  // 👇 New Attachment Field Added
  attachment: {
    url: { type: String }, // File path (e.g., uploads/image-123.jpg)
    type: { type: String } // Type (e.g., 'image', 'pdf')
  },

  isRead: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);