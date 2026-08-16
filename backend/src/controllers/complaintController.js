const Complaint = require('../models/Complaint');

const ALLOWED_CREATE_FIELDS = ['name', 'address', 'city', 'state', 'pincode', 'comment', 'attachmentUrl'];
const ALLOWED_UPDATE_FIELDS = ['name', 'address', 'city', 'state', 'pincode', 'comment', 'attachmentUrl'];

const createComplaint = async (req, res, next) => {
  try {
    const { name, address, city, state, pincode, comment, attachmentUrl } = req.body;

    if (!name || !address || !city || !state || !pincode || !comment) {
      return res.status(400).json({ success: false, message: 'All required fields must be provided' });
    }

    const complaint = await Complaint.create({
      userId: req.user._id,
      name: name.trim(),
      address: address.trim(),
      city: city.trim(),
      state: state.trim(),
      pincode,
      comment: comment.trim(),
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

    if (req.user.userType === 'Ordinary' && req.user._id.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'You can only view your own complaints' });
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

    if (req.user.userType === 'Ordinary' && complaint.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.status(200).json({ success: true, data: complaint });
  } catch (error) {
    next(error);
  }
};

const updateComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    if (req.user.userType === 'Ordinary' && complaint.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const updates = {};
    for (const field of ALLOWED_UPDATE_FIELDS) {
      if (req.body[field] !== undefined) {
        updates[field] = typeof req.body[field] === 'string' ? req.body[field].trim() : req.body[field];
      }
    }

    const updated = await Complaint.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

const deleteComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    if (req.user.userType === 'Ordinary' && complaint.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    await Complaint.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Complaint deleted successfully' });
  } catch (error) {
    next(error);
  }
};

const getAllComplaints = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const skip = (page - 1) * limit;

    const [complaints, total] = await Promise.all([
      Complaint.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Complaint.countDocuments({}),
    ]);

    res.status(200).json({
      success: true,
      data: complaints,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
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
