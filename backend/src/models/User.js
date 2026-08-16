const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    maxlength: [254, 'Email cannot exceed 254 characters'],
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
  userType: {
    type: String,
    required: true,
    enum: ['Admin', 'Agent', 'Ordinary'],
    default: 'Ordinary',
  },
}, { timestamps: true });

userSchema.index({ userType: 1 });

module.exports = mongoose.model('User', userSchema);
