// config.js

require('dotenv').config();

module.exports = {
  app: {
    port: process.env.PORT || 3000,
  },
  db: {
    dialect: 'sqlite',
    storage: './database.sqlite', // Path to SQLite file
    logging: false, // Disable logging in production
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: '1h', // Token expiration time
  },
};
