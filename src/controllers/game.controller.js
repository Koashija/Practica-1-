import Game from '../models/Game.js';
import Sala from '../models/Sala.js';

// Obtener el historial de partidas del usuario
export const getHistory = async (req, res, next) => {
  try {
    const history = await Game.find({ players: req.user.id })
      .populate('players', 'username email wins stats') // Traemos stats explícitamente
      .populate('winner', 'username')
      .sort({ createdAt: -1 });

    res.status(200).json(history);
  } catch (error) {
    next(error);
  }
};

// Buscar un oponente o crear una sala de espera multijugador
export const buscarPartida = async (req, res, next) => {
  const { userId } = req.body;

  try {
    // 1. Verificar si el usuario ya tiene una sala activa
    let salaActiva = await Sala.findOne({ 
      $or: [{ jugador1: userId }, { jugador2: userId }], 
      estado: { $ne: 'terminado' } 
    });

    if (salaActiva) {
      return res.status(200).json({ msg: "Ya estás en una sala", sala: salaActiva });
    }

    // 2. Buscar si hay alguna sala libre esperando
    let salaDisponible = await Sala.findOne({ estado: 'esperando', jugador1: { $ne: userId } });

    if (salaDisponible) {
      salaDisponible.jugador2 = userId;
      salaDisponible.estado = 'jugando';
      await salaDisponible.save();

      return res.status(200).json({ msg: "Oponente encontrado", sala: salaDisponible });
    } else {
      // 3. Crear nueva sala
      const nuevaSala = new Sala({ jugador1: userId, estado: 'esperando' });
      await nuevaSala.save();

      return res.status(201).json({ msg: "Esperando oponente", sala: nuevaSala });
    }
  } catch (error) {
    next(error);
  }
};

export const obtenerEstadoSala = async (req, res, next) => {
  try {
    const sala = await Sala.findById(req.params.id);
    if (!sala) return res.status(404).json({ error: "Sala no encontrada" });
    res.status(200).json(sala);
  } catch (error) {
    next(error);
  }
};