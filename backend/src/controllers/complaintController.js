const Complaint = require('../models/Complaint');

const createComplaint = async (req, res, next) => {
  try {
    const { userId, name, address, city, state, pincode, comment, attachmentUrl } = req.body;

    const complaint = await Complaint.create({
      userId,
      name,
      address,
      city,
      state,
      pincode,
      comment,
      attachmentUrl,
    });

    res.status(201).json({ success: true, data: complaint });
  } catch (error) {
    next(error);
  }
};

const getUserComplaints = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    if (!userId) {
      return res.status(400).json({ success: false, message: 'User id is required' });
    }
    const complaints = await Complaint.find({ userId });
    res.status(200).json({ success: true, data: complaints });
  } catch (error) {
    next(error);
  }
};

const getComplaintById = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }
    res.status(200).json({ success: true, data: complaint });
  } catch (error) {
    next(error);
  }
};

const updateComplaint = async (req, res, next) => {
  try {
    const updated = await Complaint.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

const deleteComplaint = async (req, res, next) => {
  try {
    const deleted = await Complaint.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }
    res.status(200).json({ success: true, data: deleted });
  } catch (error) {
    next(error);
  }
};

const getAllComplaints = async (req, res, next) => {
  try {
    const complaints = await Complaint.find({});
    res.status(200).json({ success: true, data: complaints });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createComplaint,
  getUserComplaints,
  getComplaintById,
  updateComplaint,
  deleteComplaint,
  getAllComplaints,
};
