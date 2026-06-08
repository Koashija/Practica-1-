import express from 'express';
import { saveGame, getHistory, getStats } from '../controllers/game.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = express.Router();

/**
 * @swagger
 * /api/game/save:
 * post:
 * summary: Guardar partida
 * tags: [Game]
 * security:
 * - bearerAuth: []
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * result:
 * type: string
 * responses:
 * 201:
 * description: Guardado
 */
router.post('/save', authMiddleware, saveGame);

/**
 * @swagger
 * /api/game/history:
 * get:
 * summary: Historial de partidas
 * tags: [Game]
 * security:
 * - bearerAuth: []
 * responses:
 * 200:
 * description: OK
 */
router.get('/history', authMiddleware, getHistory);

/**
 * @swagger
 * /api/game/stats:
 * get:
 * summary: Estadísticas
 * tags: [Game]
 * security:
 * - bearerAuth: []
 * responses:
 * 200:
 * description: OK
 */
router.get('/stats', authMiddleware, getStats);

export default router;