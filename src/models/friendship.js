const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/db');  // Sequelize instance

const Friendship = sequelize.define('Friendship', {
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  friend_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
},{
  indexes: [
    {
      unique:true,
      fields: [ 'user_id', 'friend_id']
    }
  ]
});

module.exports = Friendship;
