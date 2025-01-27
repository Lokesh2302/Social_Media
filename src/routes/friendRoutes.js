const express = require('express');
const router = express.Router();
const friendController = require('../controllers/friendController');
const authMiddleware = require('../middleware/authMiddleware')

// Route to render friends list
router.get('/myFriends', authMiddleware.isAuthenticated, friendController.getFriendsList);

// Send a friend request
router.post('/sendFriendRequest/:id', authMiddleware.isAuthenticated, friendController.sendFriendRequest);

// Accept a friend request
router.post('/acceptFriendRequest/:id', authMiddleware.isAuthenticated, friendController.acceptFriendRequest);

// Reject a friend request
router.post('/rejectFriendRequest/:id', authMiddleware.isAuthenticated, friendController.rejectFriendRequest);


// Undo (cancel) a sent friend request
router.post('/undoFriendRequest', authMiddleware.isAuthenticated, friendController.undoFriendRequest); 


// Block user
router.post('/blockuser', authMiddleware.isAuthenticated, friendController.blockUser);

// Unblock user
router.post('/unblockUser', authMiddleware.isAuthenticated, friendController.unblockUser);



// Error handling (optional, in case you have some default routes that might be hit)
router.all('*', (req, res) => {
  return res.status(404).json({ message: 'Route not found' });
});

module.exports = router;
