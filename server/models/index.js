// src/models/index.js
const { Sequelize } = require('sequelize');
const config = require('../config/config');

const sequelize = new Sequelize({
  dialect: config.db.dialect,
  storage: config.db.storage,
  logging: config.db.logging,
});

// Export sequelize and models for use in other parts of the app
module.exports = { sequelize };
