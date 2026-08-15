const express = require('express');
const { sendMessage, getMessagesForComplaint } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, sendMessage);
router.get('/:complaintId', protect, getMessagesForComplaint);

module.exports = router;
