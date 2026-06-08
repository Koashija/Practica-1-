import express from 'express';
import { getProfile, updateProfile } from '../controllers/user.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = express.Router();

/**
 * @swagger
 * /api/users/profile:
 * get:
 * summary: Obtiene los detalles completos del perfil del usuario autenticado
 * tags:
 * - Users
 * security:
 * - bearerAuth: []
 * responses:
 * 200:
 * description: Datos devueltos satisfactoriamente.
 * 401:
 * description: No autorizado, token faltante o inválido.
 * 404:
 * description: Usuario no encontrado en la base de datos.
 * put:
 * summary: Actualiza los campos modificables del perfil de usuario
 * tags:
 * - Users
 * security:
 * - bearerAuth: []
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * username:
 * type: string
 * example: nuevo_nombre
 * email:
 * type: string
 * example: nuevo_correo@example.com
 * avatar:
 * type: string
 * example: https://ui-avatars.com/api/?name=Modificado
 * responses:
 * 200:
 * description: Perfil actualizado correctamente.
 * 400:
 * description: El nombre de usuario o email ya se encuentra en uso por otra cuenta.
 * 401:
 * description: Token no provisto o no válido.
 */
router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, updateProfile);

export default router;