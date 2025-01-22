const Game = require('../models/game');
const Move = require('../models/move');
const User = require('../models/user');
const sequelize = require('sequelize');

const winningCombinations = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
  [0, 4, 8], [2, 4, 6]            // Diagonals
];

// Start a new game
exports.startGame = async (req, res, next) => {
  try {
    const { player2Id } = req.body;
    const player1Id = req.user.id;

    if (player1Id === player2Id) {
      return res.status(400).json({ error: 'You cannot play against yourself.' });
    }

    const currentTurn = Math.random() < 0.5 ? player1Id : player2Id;
    const game = await Game.create({ player1Id, player2Id, currentTurn });

    res.status(201).json({ message: 'Game started', gameId: game.id, currentTurn });
  } catch (error) {
    next(error);
  }
};

// Make a move
exports.makeMove = async (req, res, next) => {
  try {
    const { gameId, position } = req.body;
    const game = await Game.findByPk(gameId);

    if (!game) return res.status(404).json({ message: 'Game not found' });
    if (game.status !== 'ongoing') return res.status(400).json({ message: 'Game already ended' });

    const currentPlayerId = req.user.id;
    if (game.currentTurn !== currentPlayerId) return res.status(400).json({ message: 'Not your turn' });

    const moves = await Move.findAll({ where: { gameId }, order: [['createdAt', 'ASC']] });

    // Construct the board state from moves
    const board = Array(9).fill(null);
    moves.forEach(move => {
      board[move.position] = move.playerId === game.player1Id ? 'X' : 'O';
    });

    if (board[position] !== null) {
      return res.status(400).json({ message: 'Position already taken' });
    }

    // Record the move
    await Move.create({ gameId, playerId: currentPlayerId, position });

    // Update board state
    board[position] = currentPlayerId === game.player1Id ? 'X' : 'O';

    // Check for winner or draw
    const winner = checkWinner(board);
    if (winner) {
      game.status = 'finished';
      game.winnerId = currentPlayerId;
      await game.save();
      return res.json({ message: 'You win!', game });
    }

    if (board.every(cell => cell !== null)) {
      game.status = 'draw';
      await game.save();
      return res.json({ message: 'Game is a draw!', game });
    }

    // Switch turns
    game.currentTurn = currentPlayerId === game.player1Id ? game.player2Id : game.player1Id;
    await game.save();

    res.json({ message: 'Move recorded', game });

  } catch (error) {
    next(error);
  }
};

// Get game history
exports.getGameHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Fetch all games where the authenticated user is either player1 or player2
    const games = await Game.findAll({
      where: {
        [sequelize.Op.or]: [
          { player1Id: userId },
          { player2Id: userId }
        ]
      },
      include: [
        {
          model: User,
          as: 'player1',
          attributes: ['id', 'username'],
        },
        {
          model: User,
          as: 'player2',
          attributes: ['id', 'username'],
        }
      ]
    });

    if (!games || games.length === 0) {
      return res.status(404).json({ message: 'No games found' });
    }

    // Fetch moves and game details for each game
    const gameHistory = await Promise.all(games.map(async (game) => {
      // Fetch moves for this game
      const moves = await Move.findAll({
        where: { gameId: game.id },
        order: [['createdAt', 'ASC']] // Ensure moves are sorted by creation time
      });

      // Construct the timeline of moves
      const moveHistory = moves.map(move => ({
        player: move.playerId === game.player1Id ? 'player1' : 'player2',
        position: move.position,
        time: move.createdAt
      }));

      // Determine the opponent and game result
      const opponent = game.player1Id === userId ? game.player2 : game.player1;
      let result;

      console.log(game.status, game.winnerId, userId);
      
      if (game.status === 'finished') {
        result = game.winnerId === userId ? 'win' : 'lose';
      } else if (game.status === 'draw') {
        result = 'draw';
      } else {
        result = 'ongoing';
      }

      return {
        gameId: game.id,
        opponent: opponent.username,
        result,
        moves: moveHistory
      };
    }));

    res.status(200).json(gameHistory);

  } catch (error) {
    next(error);
  }
};

function checkWinner(board) {
  for (let combo of winningCombinations) {
    const [a, b, c] = combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
}
