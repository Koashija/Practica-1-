import { Router } from 'express';
import { getHistory } from '../controllers/game.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const router = Router();

/**
 * @swagger
 * /api/game/history:
 *   get:
 *     summary: Obtener el historial de partidas del usuario
 *     tags: [Juego]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de partidas jugadas obtenida con éxito
 *       401:
 *         description: No autorizado, token faltante o inválido
 */
router.get('/history', authenticateToken, getHistory);

export default router;