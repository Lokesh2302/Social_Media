require('dotenv').config({ path: '../.env' });

// Load associations
require('./models/associations')();
///////////////////////////////////

const express = require('express');
const session = require('express-session');
const path = require("path");
const sequelize = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const friendRoutes = require('./routes/friendRoutes');
const profileRoutes = require ('./routes/profileRoutes');
const messageRoutes = require('./routes/messageRoutes')
const app = express();
const PORT = process.env.PORT || 3000;


// Middleware to parse JSON and URL encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Session Configuration
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true
}));

// Serve static files (uploads folder)
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));  // Corrected static path
// View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../public/views'));

// Routes
app.use(userRoutes);
app.use(profileRoutes);
app.use(authRoutes);
app.use(messageRoutes);
app.use(friendRoutes);




app.all('*', (req, res) => {
  res.status(404).send('<h1>404! Page not found</h1>');
});
// Start server and connect to database
sequelize.sync({ force: false })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Error syncing the database:', error);
  });
