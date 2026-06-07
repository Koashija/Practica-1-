import Game from '../models/Game.js';
import Sala from '../models/Sala.js'; // Importamos el nuevo modelo de la sala

// Obtener el historial de partidas del usuario
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

// Buscar un oponente o crear una sala de espera multijugador
export const buscarPartida = async (req, res, next) => {
  const { userId } = req.body;

  try {
    // 1. Verificar si el usuario ya tiene una sala activa (que no haya terminado)
    let salaActiva = await Sala.findOne({ 
      $or: [{ jugador1: userId }, { jugador2: userId }], 
      estado: { $ne: 'terminado' } 
    });

    if (salaActiva) {
      return res.status(200).json({ msg: "Ya estás en una sala", sala: salaActiva });
    }

    // 2. Buscar si hay alguna sala libre esperando a un segundo jugador (y que no sea del mismo usuario)
    let salaDisponible = await Sala.findOne({ estado: 'esperando', jugador1: { $ne: userId } });

    if (salaDisponible) {
      // ¡Encontramos oponente! Nos unimos a su sala
      salaDisponible.jugador2 = userId;
      salaDisponible.estado = 'jugando';
      await salaDisponible.save();

      return res.status(200).json({ msg: "Oponente encontrado", sala: salaDisponible });
    } else {
      // 3. No hay salas disponibles, creamos una nueva para que alguien más se una
      const nuevaSala = new Sala({ jugador1: userId, estado: 'esperando' });
      await nuevaSala.save();

      return res.status(201).json({ msg: "Esperando oponente", sala: nuevaSala });
    }
  } catch (error) {
    next(error); // Delega el error al middleware global de tu API
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