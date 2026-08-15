const mongoose = require('mongoose');

const assignedComplaintSchema = new mongoose.Schema({
  agentId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  complaintId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Complaint' },
  status: {
    type: String,
    required: true,
    enum: ['Assigned', 'In Progress', 'Completed'],
    default: 'Assigned',
  },
  agentName: { type: String, required: true, trim: true },
}, { timestamps: true });

module.exports = mongoose.model('AssignedComplaint', assignedComplaintSchema);
