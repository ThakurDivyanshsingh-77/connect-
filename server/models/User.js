const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  
  // Role System
  role: { 
    type: String, 
    enum: ['junior', 'senior', 'teacher', 'admin'], 
    default: 'junior' 
  },

  // Profile Details
  headline: { type: String }, // e.g., "Full Stack Developer | BCA Student"
  designation: { type: String }, // e.g., "Software Engineer"
  batch: { type: String }, // For Example: "2023-2026"
  company: { type: String }, // For Alumni
  location: { type: String }, // e.g., "Mumbai, India"
  website: { type: String }, // Personal portfolio link
  skills: [String], // Array of skills
  bio: { type: String },
  
  avatar_url: { type: String }, // User Profile Photo
  field_of_study: { type: String }, // e.g., "BCA", "B.Tech"

  // Verification System
  idCardUrl: { type: String }, // Image URL for ID
  isVerified: { type: Boolean, default: false }, // Login access control
  verificationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },

  // Leaderboard Points
  points: { type: Number, default: 0 },

  // 👇 --- NEW SETTINGS FIELD ADDED --- 👇
  settings: {
    emailNotifications: {
      type: Boolean,
      default: true
    },
    profileVisibility: {
      type: String,
      enum: ['public', 'private'],
      default: 'public'
    }
  }
  // -------------------------------------

}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);