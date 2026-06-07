import Game from '../models/Game.js';

export const getHistory = async (req, res, next) => {
  try {
    // Buscar partidas donde participó el usuario autenticado
    const history = await Game.find({ players: req.user.id })
      .populate('players', 'username email wins')
      .populate('winner', 'username')
      .sort({ createdAt: -1 });

    res.status(200).json(history);
  } catch (error) {
    next(error);
  }
};