import { Router } from 'express';
// CORRECCIÓN: Agregada obtenerEstadoSala al import destructuring
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

export default router;