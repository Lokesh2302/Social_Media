const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/db');  // Sequelize instance

const BlockList = sequelize.define('BlockList', {
  blocked_by_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  blocked_whom_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
});


module.exports = BlockList;
