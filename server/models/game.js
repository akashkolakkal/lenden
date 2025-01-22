const { DataTypes } = require('sequelize');
const { sequelize } = require('./index');
const User = require('./user'); // Import User model

const Game = sequelize.define('Game', {
  player1Id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  player2Id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  currentTurn: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: null, // Will be set to player1Id or player2Id when the game starts
  },
  winnerId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'ongoing', // 'ongoing', 'completed'
  },
  board: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: '---------', // Represents an empty board in a simple string format
  },
  moves: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: [], // Stores the history of moves as an array of objects
  },
});

// Associations
Game.belongsTo(User, { as: 'player1', foreignKey: 'player1Id' });
Game.belongsTo(User, { as: 'player2', foreignKey: 'player2Id' });

module.exports = Game;
