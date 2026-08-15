const express = require('express');
const {
  getAgents,
  getOrdinaryUsers,
  deleteUser,
  updateUser,
  assignComplaint,
  getAssignedComplaints,
  updateComplaintStatus,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/agents', protect, authorize('Admin'), getAgents);
router.get('/users', protect, authorize('Admin'), getOrdinaryUsers);
router.delete('/users/:id', protect, authorize('Admin'), deleteUser);
router.put('/users/:id', protect, authorize('Admin'), updateUser);
router.post('/assign', protect, authorize('Admin'), assignComplaint);
router.get('/assigned/:agentId', protect, authorize('Agent', 'Admin'), getAssignedComplaints);
router.put('/status/:complaintId', protect, authorize('Agent', 'Admin'), updateComplaintStatus);

module.exports = router;
