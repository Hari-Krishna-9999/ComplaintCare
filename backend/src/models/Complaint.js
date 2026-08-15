const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  name: { type: String, required: true, trim: true },
  address: { type: String, required: true, trim: true },
  city: { type: String, required: true, trim: true },
  state: { type: String, required: true, trim: true },
  pincode: { type: Number, required: true },
  comment: { type: String, required: true, trim: true },
  status: {
    type: String,
    required: true,
    enum: ['Pending', 'In Progress', 'Resolved', 'Rejected'],
    default: 'Pending',
  },
  attachmentUrl: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Complaint', complaintSchema);
