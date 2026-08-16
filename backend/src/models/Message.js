const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  complaintId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Complaint',
    required: [true, 'Complaint ID is required'],
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters'],
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
    maxlength: [2000, 'Message cannot exceed 2000 characters'],
  },
}, { timestamps: true });

messageSchema.index({ complaintId: 1, createdAt: 1 });

module.exports = mongoose.model('Message', messageSchema);
