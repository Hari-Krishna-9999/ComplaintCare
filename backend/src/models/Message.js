const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  complaintId: { type: mongoose.Schema.Types.ObjectId, ref: 'Complaint', required: true },
  name: { type: String, required: true, trim: true },
  message: { type: String, required: true, trim: true },
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
