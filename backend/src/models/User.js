const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  passwordResetToken: String,
  passwordResetExpires: Date,
  userType: {
    type: String,
    required: true,
    enum: ['Admin', 'Agent', 'Ordinary'],
    default: 'Ordinary',
  },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
