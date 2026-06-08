import { Router } from 'express';
import { getHistory, guardarPartidaLocal } from '../controllers/game.controller.js'; 
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
 */
router.get('/history', authenticateToken, getHistory);

/**
 * @swagger
 * /api/game/guardar:
 *   post:
 *     summary: Guardar el resultado de una partida local
 *     tags: [Juego]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               board:
 *                 type: array
 *                 items:
 *                   type: string
 *               status:
 *                 type: string
 *               winner:
 *                 type: string
 *     responses:
 *       201:
 *         description: Partida guardada con éxito
 */
router.post('/guardar', authenticateToken, guardarPartidaLocal);

export default router;