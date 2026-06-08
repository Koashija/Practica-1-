import { Router } from 'express';
import { getHistory, buscarPartida, obtenerEstadoSala } from '../controllers/game.controller.js'; 
import { authenticateToken } from '../middlewares/auth.middleware.js';

const router = Router();

/**
 * @swagger
 * /api/game/history:
 * get:
 * summary: Obtener el historial de partidas del usuario
 * tags: [Juego]
 * security:
 * - bearerAuth: []
 * responses:
 * 200:
 * description: Lista de partidas jugadas obtenida con éxito
 * 401:
 * description: No autorizado, token faltante o inválido
 */
router.get('/history', authenticateToken, getHistory);

/**
 * @swagger
 * /api/game/buscar:
 * post:
 * summary: Buscar un oponente o crear una sala de espera multijugador
 * tags: [Juego]
 * security:
 * - bearerAuth: []
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required:
 * - userId
 * properties:
 * userId:
 * type: string
 * description: ID del usuario que busca partida
 * responses:
 * 200:
 * description: Oponente encontrado o ya se encuentra en una sala activa
 * 201:
 * description: No hay oponentes disponibles, sala creada en espera de rival
 * 401:
 * description: No autorizado
 * 500:
 * description: Error en el servidor de emparejamiento
 */
router.post('/buscar', authenticateToken, buscarPartida);

/**
 * @swagger
 * /api/game/sala/{id}:
 * get:
 * summary: Obtener el estado actual de una sala de juego específica
 * tags: [Juego]
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: string
 * description: ID único de la sala
 * responses:
 * 200:
 * description: Datos de la sala obtenidos con éxito
 * 404:
 * description: Sala no encontrada
 * 401:
 * description: No autorizado
 */
router.get('/sala/:id', authenticateToken, obtenerEstadoSala);

/**
 * @swagger
 * /api/game/sala/{id}/terminar:
 * post:
 * summary: Finalizar y cerrar una sala por abandono o salida del jugador
 * tags: [Juego]
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: string
 * description: ID de la sala que se desea destruir/finalizar
 * responses:
 * 200:
 * description: Sala cerrada con éxito en MongoDB
 * 500:
 * description: Error al intentar cerrar la sala
 * 401:
 * description: No autorizado
 */
router.post('/sala/:id/terminar', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Importación dinámica local para no ensuciar los imports superiores
    const Sala = (await import('../models/Sala.js')).default;
    const Game = (await import('../models/Game.js')).default;

    // Marcamos la sala HTTP como 'terminado' y el juego de sockets como 'abandoned'
    await Sala.findByIdAndUpdate(id, { estado: 'terminado' });
    await Game.findOneAndUpdate({ room: id }, { status: 'abandoned' });
    
    console.log(`[HTTP] Sala ${id} cerrada exitosamente desde el celular.`);
    res.status(200).json({ msg: "Sala cerrada con éxito en MongoDB." });
  } catch (error) {
    console.error("Error al cerrar sala por HTTP:", error);
    res.status(500).json({ error: "No se pudo cerrar la sala." });
  }
});

export default router;