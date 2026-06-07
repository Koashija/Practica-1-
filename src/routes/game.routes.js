import { Router } from 'express';
import { getHistory, buscarPartida } from '../controllers/game.controller.js'; // Importamos la nueva función del controlador
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
router.get('/sala/:id', authenticateToken, obtenerEstadoSala);
export default router;