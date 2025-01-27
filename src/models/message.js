const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/db');  // Sequelize instance

const Message = sequelize.define('Message', {
  sender_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  receiver_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt timestamps
});

module.exports = Message;
