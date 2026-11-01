const bcrypt = require('bcryptjs');
const User = require('../models/User');
const AssignedComplaint = require('../models/AssignedComplaint');
const Complaint = require('../models/Complaint');
const Message = require('../models/Message');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN_LENGTH = 8;
const NAME_MAX_LENGTH = 100;
const EMAIL_MAX_LENGTH = 254;

const validatePassword = (password) => {
  if (!password || password.length < PASSWORD_MIN_LENGTH) {
    return `Password must be at least ${PASSWORD_MIN_LENGTH} characters long`;
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter';
  }
  if (!/[0-9]/.test(password)) {
    return 'Password must contain at least one number';
  }
  return null;
};

const createAgent = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    if (name.length > NAME_MAX_LENGTH) {
      return res.status(400).json({ success: false, message: `Name must be at most ${NAME_MAX_LENGTH} characters` });
    }

    if (!EMAIL_REGEX.test(email) || email.length > EMAIL_MAX_LENGTH) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return res.status(400).json({ success: false, message: passwordError });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Email already in use' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const agent = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      userType: 'Agent',
    });

    res.status(201).json({
      success: true,
      message: 'Agent created successfully',
      data: {
        _id: agent._id,
        name: agent.name,
        email: agent.email,
        userType: agent.userType,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getAgents = async (req, res, next) => {
  try {
    const agents = await User.find({ userType: 'Agent' }).select('-password -passwordResetToken -passwordResetExpires');
    res.status(200).json({ success: true, data: agents });
  } catch (error) {
    next(error);
  }
};

const getOrdinaryUsers = async (req, res, next) => {
  try {
    const users = await User.find({ userType: 'Ordinary' }).select('-password -passwordResetToken -passwordResetExpires');
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

    const userComplaints = await Complaint.find({ userId: req.params.id });
    const complaintIds = userComplaints.map((c) => c._id);

    await Promise.all([
      Complaint.deleteMany({ userId: req.params.id }),
      AssignedComplaint.deleteMany({
        $or: [{ agentId: req.params.id }, { complaintId: { $in: complaintIds } }],
      }),
      Message.deleteMany({ complaintId: { $in: complaintIds } }),
    ]);

    res.status(200).json({ success: true, message: 'User and related data deleted successfully' });
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const ALLOWED_FIELDS = ['name', 'email', 'userType'];
    const updates = {};
    for (const field of ALLOWED_FIELDS) {
      if (req.body[field] !== undefined) {
        updates[field] = typeof req.body[field] === 'string' ? req.body[field].trim() : req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: 'No valid fields to update' });
    }

    const updated = await User.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true })
      .select('-password -passwordResetToken -passwordResetExpires');
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

    if (!agentId || !complaintId || !agentName) {
      return res.status(400).json({ success: false, message: 'agentId, complaintId, and agentName are required' });
    }

    const agent = await User.findById(agentId);
    if (!agent || agent.userType !== 'Agent') {
      return res.status(400).json({ success: false, message: 'Invalid agent' });
    }

    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    const existingAssignment = await AssignedComplaint.findOne({ complaintId });
    if (existingAssignment) {
      return res.status(409).json({ success: false, message: 'This complaint is already assigned to an agent' });
    }

    const assignment = await AssignedComplaint.create({
      agentId,
      complaintId,
      status: status || 'Assigned',
      agentName: agentName.trim(),
    });
    await Complaint.findByIdAndUpdate(complaintId, { status: 'In Progress' });
    res.status(201).json({ success: true, data: assignment });
  } catch (error) {
    next(error);
  }
};

const getAssignedComplaints = async (req, res, next) => {
  try {
    const assigned = await AssignedComplaint.find({ agentId: req.params.agentId }).populate('complaintId');

    const formatted = assigned
      .filter((entry) => entry.complaintId)
      .map((entry) => ({
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
    const { status } = req.body;
    const ALLOWED_STATUSES = ['Pending', 'In Progress', 'Resolved', 'Rejected'];

    if (!status || !ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${ALLOWED_STATUSES.join(', ')}`,
      });
    }

    const updated = await Complaint.findByIdAndUpdate(
      req.params.complaintId,
      { status },
      { new: true, runValidators: true }
    );
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAgent,
  getAgents,
  getOrdinaryUsers,
  deleteUser,
  updateUser,
  assignComplaint,
  getAssignedComplaints,
  updateComplaintStatus,
};
