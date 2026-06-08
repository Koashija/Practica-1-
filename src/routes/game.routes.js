import express from 'express';
import { saveGame, getHistory, getStats } from '../controllers/game.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = express.Router();

/**
 * @swagger
 * /api/game/save:
 * post:
 * summary: Registra y almacena el resultado de una nueva partida jugada
 * tags:
 * - Game
 * security:
 * - bearerAuth: []
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required:
 * - result
 * properties:
 * result:
 * type: string
 * enum: [victoria, derrota, empate]
 * example: victoria
 * responses:
 * 201:
 * description: Partida guardada perfectamente en el historial de la base de datos.
 * 400:
 * description: El resultado enviado no pertenece a los valores válidos admitidos.
 * 401:
 * description: Token inválido o autorización denegada.
 */
router.post('/save', authMiddleware, saveGame);

/**
 * @swagger
 * /api/game/history:
 * get:
 * summary: Obtiene el listado completo e histórico cronológico de partidas del usuario
 * tags:
 * - Game
 * security:
 * - bearerAuth: []
 * responses:
 * 200:
 * description: Listado devuelto ordenado desde el más reciente al más antiguo.
 * 401:
 * description: No autenticado.
 */
router.get('/history', authMiddleware, getHistory);

/**
 * @swagger
 * /api/game/stats:
 * get:
 * summary: Obtiene un objeto acumulativo con los totales de victorias, derrotas, empates y partidas totales
 * tags:
 * - Game
 * security:
 * - bearerAuth: []
 * responses:
 * 200:
 * description: Estadísticas calculadas devueltas de manera óptima.
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * victorias:
 * type: integer
 * derrotas:
 * type: integer
 * empates:
 * type: integer
 * totalPartidas:
 * type: integer
 * 401:
 * description: Autenticación requerida.
 */
router.get('/stats', authMiddleware, getStats);

export default router;