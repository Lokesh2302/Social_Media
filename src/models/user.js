const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/db');  // Sequelize instance


const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  age: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  profilePic: {
    type: DataTypes.STRING, 
    allowNull: true
  }
}, {
  timestamps: true,  // Automatically adds createdAt and updatedAt
});


module.exports = User;