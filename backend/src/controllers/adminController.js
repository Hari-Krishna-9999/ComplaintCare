const User = require('../models/User');
const AssignedComplaint = require('../models/AssignedComplaint');
const Complaint = require('../models/Complaint');

const getAgents = async (req, res, next) => {
  try {
    const agents = await User.find({ userType: 'Agent' }).select('-password');
    res.status(200).json({ success: true, data: agents });
  } catch (error) {
    next(error);
  }
};

const getOrdinaryUsers = async (req, res, next) => {
  try {
    const users = await User.find({ userType: 'Ordinary' }).select('-password');
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, data: deleted });
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const updated = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).select('-password');
    if (!updated) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

const assignComplaint = async (req, res, next) => {
  try {
    const { agentId, complaintId, status, agentName } = req.body;
    const assignment = await AssignedComplaint.create({ agentId, complaintId, status, agentName });
    await Complaint.findByIdAndUpdate(complaintId, { status: 'In Progress' });
    res.status(201).json({ success: true, data: assignment });
  } catch (error) {
    next(error);
  }
};

const getAssignedComplaints = async (req, res, next) => {
  try {
    const assigned = await AssignedComplaint.find({ agentId: req.params.agentId }).populate('complaintId');
    const formatted = assigned.map((entry) => ({
      ...entry.complaintId.toObject(),
      assignmentId: entry._id,
      agentId: entry.agentId,
      agentName: entry.agentName,
      assignedStatus: entry.status,
    }));
    res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    next(error);
  }
};

const updateComplaintStatus = async (req, res, next) => {
  try {
    const updated = await Complaint.findByIdAndUpdate(req.params.complaintId, { status: req.body.status }, { new: true, runValidators: true });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAgents,
  getOrdinaryUsers,
  deleteUser,
  updateUser,
  assignComplaint,
  getAssignedComplaints,
  updateComplaintStatus,
};
