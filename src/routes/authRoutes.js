// authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const upload = require('../config/multerConfig');
const userController = require('../controllers/userController');

// Signup route
router.get('/signup', (req, res) => {
  res.render('signup', { error: null });
});
// POST Signup route with image upload
router.post('/signup', upload.single('profilePic'), authController.signup);

// Login route
router.get('/login', (req, res) => {
  const successMessage = req.query.success || null;
  const username = req.query.username || ''; // Get the username from the query parameters, ye jab update karnege tab // Pre-fill the email field
  console.log('succes:', username);
  console.log('Usernamedff:', username);
  
  res.render('login', { error: null, success: successMessage, username});
});

router.post('/login', authController.login);

// Logout route
router.get('/logout', authController.logout);

module.exports = router;
