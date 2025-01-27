const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const ProfileController = require('../controllers/profileController');
const upload = require('../config/multerConfig');
const CommentController = require('../controllers/commentController')
// Get profile page with posts of the user and their friends
router.get('/profile/:id', authMiddleware.isAuthenticated, ProfileController.getProfilePosts);

// Route to render the create post form
router.get('/createPost', authMiddleware.isAuthenticated, ProfileController.renderCreatePost);

// Route to handle post creation
router.post('/createPost', authMiddleware.isAuthenticated, upload.single('image'), ProfileController.createPost);

// Route to like or unlike a post
router.post('/likePost/:postId', authMiddleware.isAuthenticated, ProfileController.likePost);

// Route to add a comment to a post
router.post('/comments/:postId', authMiddleware.isAuthenticated, CommentController.addComment);

// Route to delete a comment from a post
router.delete('/comments/:commentId', authMiddleware.isAuthenticated, CommentController.deleteComment);


// Display current user's post
router.get('/profile/:id/myPosts', ProfileController.getCurrentUserPosts);


// Edit caption form route
router.get('/editCaption/:postId', authMiddleware.isAuthenticated, ProfileController.renderEditCaption);

// Handle caption update (POST)
router.post('/updateCaption/:postId',authMiddleware.isAuthenticated, ProfileController.updateCaption)

// Profile Routes 
router.post('/deletePost/:postId', authMiddleware.isAuthenticated, ProfileController.deletePost);


// Route to get friend's profile and posts
router.get('/profile/friend/:id', authMiddleware.isAuthenticated, ProfileController.getFriendProfilePosts);


module.exports = router;