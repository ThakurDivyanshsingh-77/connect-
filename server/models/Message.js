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
    required: false
  },
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room'
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'file', 'announcement'],
    default: 'text'
  },
  content: {
    type: String,
    // required: true 👈 Yeh hata diya, taaki empty message (sirf file) allow ho
  },
  
  // 👇 New Attachment Field Added
  attachment: {
    url: { type: String }, // File path (e.g., uploads/image-123.jpg)
    type: { type: String }, // Type (e.g., 'image', 'pdf')
    public_id: { type: String }
  },

  isPinned: {
    type: Boolean,
    default: false
  },
  
  reactions: [{
    emoji: { type: String, required: true },
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  }],

  isRead: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);