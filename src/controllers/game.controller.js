import Game from '../models/Game.js';

export const saveGame = async (req, res, next) => {
  try {
    const { result } = req.body;

    if (!['victoria', 'derrota', 'empate'].includes(result)) {
      return res.status(400).json({ message: 'Resultado de partida no válido. Debe ser victoria, derrota o empate.' });
    }

    const newGame = new Game({
      userId: req.user.id,
      result
    });

    await newGame.save();
    return res.status(201).json(newGame);
  } catch (error) {
    next(error);
  }
};

export const getHistory = async (req, res, next) => {
  try {
    const history = await Game.find({ userId: req.user.id }).sort({ playedAt: -1 });
    return res.json(history);
  } catch (error) {
    next(error);
  }
};

export const getStats = async (req, res, next) => {
  try {
    const games = await Game.find({ userId: req.user.id });

    const stats = {
      victorias: 0,
      derrotas: 0,
      empates: 0,
      totalPartidas: games.length
    };

    games.forEach((game) => {
      if (game.result === 'victoria') stats.victorias++;
      if (game.result === 'derrota') stats.derrotas++;
      if (game.result === 'empate') stats.empates++;
    });

    return res.json(stats);
  } catch (error) {
    next(error);
  }
};