// Check if there is any incorrect or stray variable
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Post = require('../models/post');
const User = require('../models/user');

// Ensure there's no "cccc" or other undefined variables
const PostLikes = sequelize.define('PostLikes', {
  postId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Post,  // References the Post model
      key: 'id',    // Refers to the 'id' column of the Post table
    },
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,  // References the User model
      key: 'id',    // Refers to the 'id' column of the User table
    },
  },
}, {
  timestamps: false,  // No timestamps for the join table
});

// Check that this is the end of the file and there are no stray variables
module.exports = PostLikes;
