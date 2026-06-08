import Game from '../models/Game.js';
import Sala from '../models/Sala.js';
import User from '../models/User.js';

/**
 * Obtener el historial de partidas del usuario autenticado
 */
export const getHistory = async (req, res, next) => {
  try {
    // Buscar partidas donde participó el usuario autenticado
    const history = await Game.find({ players: req.user.id })
      .populate('players', 'username email wins stats') // Traemos stats explícitamente para evitar los undefined en el perfil
      .populate('winner', 'username')
      .sort({ createdAt: -1 });

    res.status(200).json(history);
  } catch (error) {
    next(error);
  }
};

/**
 * Buscar un oponente o crear una sala de espera multijugador HTTP
 * Resuelve el bug bloqueante cerrando salas congeladas viejas del usuario de forma automática
 */
export const buscarPartida = async (req, res, next) => {
  const { userId } = req.body;

  try {
    if (!userId) {
      return res.status(400).json({ error: "El id de usuario (userId) es requerido." });
    }

    // 1. LIMPIEZA INICIAL AUTOMÁTICA (Elimina el bucle infinito)
    // Si el usuario tenía salas anteriores en estado 'esperando' o 'jugando' abandonadas,
    // las cerramos a la fuerza en la base de datos configurando su estado en 'terminado'
    await Sala.updateMany(
      { 
        $or: [{ jugador1: userId }, { jugador2: userId }], 
        estado: { $in: ['esperando', 'jugando'] } 
      },
      { $set: { estado: 'terminado' } }
    );

    // Hacemos lo mismo con partidas de Sockets vinculadas que se hayan quedado abiertas
    await Game.updateMany(
      { players: userId, status: 'playing' },
      { $set: { status: 'abandoned' } }
    );

    // 2. BUSCAR SALA DISPONIBLE
    // Buscamos si hay alguna sala libre esperando a un segundo jugador creada por ALGUIEN MÁS
    let salaDisponible = await Sala.findOne({ 
      estado: 'esperando', 
      jugador1: { $ne: userId } 
    });

    if (salaDisponible) {
      // ¡Encontramos un oponente real! Nos unimos a su sala
      salaDisponible.jugador2 = userId;
      salaDisponible.estado = 'jugando';
      await salaDisponible.save();

      console.log(`[Matchmaking] Sala ${salaDisponible._id} iniciada. Jugador 1: ${salaDisponible.jugador1}, Jugador 2: ${salaDisponible.jugador2}`);
      return res.status(200).json({ msg: "Oponente encontrado", sala: salaDisponible });
    } else {
      // 3. CREAR NUEVA SALA DESDE CERO
      // No hay nadie esperando en este instante, creamos una sala limpia para este usuario
      const nuevaSala = new Sala({ 
        jugador1: userId, 
        estado: 'esperando' 
      });
      await nuevaSala.save();

      console.log(`[Matchmaking] Nueva sala de espera creada (${nuevaSala._id}) para el usuario: ${userId}`);
      return res.status(201).json({ msg: "Esperando oponente", sala: nuevaSala });
    }
  } catch (error) {
    next(error); // Delega el error al middleware global de tu API
  }
};

/**
 * Consultar el estado actual de una sala mediante Polling HTTP
 */
export const obtenerEstadoSala = async (req, res, next) => {
  try {
    const sala = await Sala.findById(req.params.id);
    if (!sala) {
      return res.status(404).json({ error: "Sala no encontrada" });
    }
    res.status(200).json(sala);
  } catch (error) {
    next(error);
  }
};