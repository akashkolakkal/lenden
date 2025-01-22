const express = require('express');
const gameController = require('../controllers/gameController');
const authenticate = require('../middlewares/auth');

const router = express.Router();

router.post('/start', authenticate ,gameController.startGame);
router.post('/move', authenticate , gameController.makeMove);
router.get('/history', authenticate , gameController.getGameHistory);

module.exports = router;
