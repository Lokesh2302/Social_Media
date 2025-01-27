const {  DataTypes } = require('sequelize');
const sequelize = require('../config/db');  // Sequelize instance

const RejectRequestsData = sequelize.define('rejectRequestsData', {
    sender_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      receiver_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
    }, {
        timestamps: true,
        updatedAt: false,
      });
      
module.exports = RejectRequestsData;