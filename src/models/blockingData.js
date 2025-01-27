const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');  // Sequelize instance

const BlockingData = sequelize.define('BlockingData', {
    blocked_by_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      blocked_whom_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
    }, {
        timestamps: true,
        updatedAt: false,
      });
      
module.exports = BlockingData;