const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Post = sequelize.define('Post', {
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    imageUrl: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    caption: {
        type: DataTypes.STRING,
        allowNull: true,
    },
}, {
    timestamps: true,
});


module.exports = Post;