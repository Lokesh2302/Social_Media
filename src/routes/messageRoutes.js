const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const MessageController = require('../controllers/messageController')
// Get messages between users
router.get('/messages/:friendId', authMiddleware.isAuthenticated, MessageController.getMessages);

// Send a message
router.post('/messages/:friendId', authMiddleware.isAuthenticated, MessageController.sendMessage);

module.exports = router;