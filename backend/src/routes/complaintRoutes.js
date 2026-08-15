const express = require('express');
const {
  createComplaint,
  getUserComplaints,
  getComplaintById,
  updateComplaint,
  deleteComplaint,
  getAllComplaints,
} = require('../controllers/complaintController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, authorize('Admin'), getAllComplaints);
router.post('/', protect, createComplaint);
router.get('/user/:userId', protect, getUserComplaints);
router.get('/:id', protect, getComplaintById);
router.put('/:id', protect, updateComplaint);
router.delete('/:id', protect, deleteComplaint);

module.exports = router;
