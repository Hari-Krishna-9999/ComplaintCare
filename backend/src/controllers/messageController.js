const Message = require('../models/Message');

const sendMessage = async (req, res, next) => {
  try {
    const { complaintId, name, message } = req.body;
    if (!complaintId || !name || !message) {
      return res.status(400).json({ success: false, message: 'ComplaintId, name, and message are required' });
    }
    const newMessage = await Message.create({ complaintId, name, message });
    res.status(201).json({ success: true, data: newMessage });
  } catch (error) {
    next(error);
  }
};

const getMessagesForComplaint = async (req, res, next) => {
  try {
    const messages = await Message.find({ complaintId: req.params.complaintId }).sort({ createdAt: 1 });
    res.status(200).json({ success: true, data: messages });
  } catch (error) {
    next(error);
  }
};

module.exports = { sendMessage, getMessagesForComplaint };
