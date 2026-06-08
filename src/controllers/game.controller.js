import Game from '../models/Game.js';
import User from '../models/User.js';

/**
 * Obtener el historial de partidas del usuario autenticado
 */
export const getHistory = async (req, res, next) => {
  try {
    const history = await Game.find({ players: req.user.id })
      .populate('players', 'username email stats')
      .sort({ createdAt: -1 });
    res.status(200).json(history);
  } catch (error) {
    next(error);
  }
};

/**
 * Guardar resultado de partida local en el historial
 */
export const guardarPartidaLocal = async (req, res, next) => {
  try {
    const { board, winner, status } = req.body; // status: 'won', 'draw'
    const userId = req.user.id;

    // Crear registro de juego
    const newGame = new Game({
      players: [userId],
      board: board,
      status: status,
      winner: winner === 'local' ? userId : null, // Ajusta según tu lógica
      createdAt: new Date()
    });
    await newGame.save();

    // Actualizar estadísticas del usuario
    if (status === 'won') {
      await User.findByIdAndUpdate(userId, { $inc: { 'stats.wins': 1, 'stats.gamesPlayed': 1 } });
    } else if (status === 'draw') {
      await User.findByIdAndUpdate(userId, { $inc: { 'stats.draws': 1, 'stats.gamesPlayed': 1 } });
    } else {
      await User.findByIdAndUpdate(userId, { $inc: { 'stats.losses': 1, 'stats.gamesPlayed': 1 } });
    }

    res.status(201).json({ msg: "Partida guardada con éxito" });
  } catch (error) {
    next(error);
  }
};