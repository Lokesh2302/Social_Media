// authMiddleware.js

exports.isAuthenticated = (req, res, next) => {
  // Check if the user is logged in by verifying the session
  if (req.session && req.session.userId) {
    // User is authenticated, proceed to the next middleware or route handler
    return next();
  }
  
  // User is not authenticated, redirect to the login page
  res.redirect('/login');
};
