// src/models/move.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('./index');

const Move = sequelize.define('Move', {
  gameId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Games', // Ensure this matches the actual Game model name
      key: 'id',
    },
  },
  playerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users', // Ensure this matches the actual User model name
      key: 'id',
    },
  },
  position: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 0,
      max: 8, // Valid positions for a 3x3 grid
    },
  },
});

module.exports = Move;
