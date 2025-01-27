const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/db');  // Sequelize instance


const FriendRequest = sequelize.define('FriendRequest', {
  sender_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  receiver_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

module.exports = FriendRequest;
