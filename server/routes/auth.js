// src/routes/auth.js
const express = require('express');
const router = express.Router();
const authControllers = require('../controllers/authControllers');
const authenticate = require('../middlewares/auth');  


router.get('/', (req, res) => {
  res.send('Hello World from AUth');
});

router.post('/register', authControllers.register);
router.post('/login', authControllers.login);

router.put('/user/profile', authenticate, authControllers.updateProfile);

module.exports = router;
