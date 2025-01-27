// userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
//nst multer = require('../config/multerConfig');
const authMiddleware = require('../middleware/authMiddleware');
// const postController = require('../controllers/postController');
// const commentController = require('../controllers/commentController');
const upload = require('../config/multerConfig');

// Home page route
router.get('/', async (req, res) => { res.render('index')});
  //All registered users route
  router.get('/users-directory', userController.getAllUsers )
  
// Dashboard route (Protected)
router.get('/dashboard', authMiddleware.isAuthenticated, userController.dashboard);

router.get('/updateprofile/:id', authMiddleware.isAuthenticated, userController.renderUpdateProfile);
// Profile update (with image upload)
router.post('/updateprofile/:id', authMiddleware.isAuthenticated, upload.single('profilePic'), userController.updateProfile);

// Route for verifying the current password
router.post('/verify-current-password', userController.verifyCurrentPassword);
// Route for updating the user's password
router.post('/updatepassword', authMiddleware.isAuthenticated, userController.updatePassword);



module.exports = router;
