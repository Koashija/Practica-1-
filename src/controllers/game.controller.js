const Game = require('../models/Game');

// @desc    Save game result
// @route   POST /api/game/save
// @access  Private
exports.saveGame = async (req, res, next) => {
  try {
    const { result } = req.body;
    const userId = req.user.id;

    const game = await Game.create({
      userId,
      result,
    });

    res.status(201).json(game);
  } catch (error) {
    next(error);
  }
};

// @desc    Get game history
// @route   GET /api/game/history
// @access  Private
exports.getHistory = async (req, res, next) => {
  try {
    const games = await Game.find({ userId: req.user.id }).sort({ playedAt: -1 });
    res.json(games);
  } catch (error) {
    next(error);
  }
};

// @desc    Get game statistics
// @route   GET /api/game/stats
// @access  Private
exports.getStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const victorias = await Game.countDocuments({ userId, result: 'victoria' });
    const derrotas = await Game.countDocuments({ userId, result: 'derrota' });
    const empates = await Game.countDocuments({ userId, result: 'empate' });
    const totalPartidas = victorias + derrotas + empates;

    res.json({
      victorias,
      derrotas,
      empates,
      totalPartidas,
    });
  } catch (error) {
    next(error);
  }
};