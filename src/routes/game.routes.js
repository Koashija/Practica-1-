const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const { saveGame, getHistory, getStats } = require('../controllers/game.controller');
const { validateSaveGame } = require('../validators/game.validator');

/**
 * @swagger
 * /api/game/save:
 *   post:
 *     summary: Save game result
 *     tags: [Game]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - result
 *             properties:
 *               result:
 *                 type: string
 *                 enum: [victoria, derrota, empate]
 *     responses:
 *       201:
 *         description: Game saved
 *       400:
 *         description: Invalid result
 */
router.post('/save', protect, validateSaveGame, saveGame);

/**
 * @swagger
 * /api/game/history:
 *   get:
 *     summary: Get user game history
 *     tags: [Game]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of games
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Game'
 */
router.get('/history', protect, getHistory);

/**
 * @swagger
 * /api/game/stats:
 *   get:
 *     summary: Get game statistics
 *     tags: [Game]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Stats'
 */
router.get('/stats', protect, getStats);

module.exports = router;