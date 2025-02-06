const express = require('express');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth');
const gameRoutes = require('./routes/game');
const { sequelize } = require('./models');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

const port = process.env.NODE_ENV === 'production' ? 80 : 3000;
const host = '0.0.0.0' ;

app.use(bodyParser.json());
app.use('/auth', authRoutes);
app.use('/game', gameRoutes);

app.use(errorHandler);

app.get('/', (req, res) => {
  res.send('The server is running!');
});

sequelize.sync().then(() => {
  app.listen(port, host, () => {
    console.log(`Server running on ${host}:${port}`);
  });
}).catch(err => {
  console.error('Failed to sync database:', err);
});
