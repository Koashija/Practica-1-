import { Router } from 'express';
import { register, login, getProfile } from '../controllers/auth.controller.js';
import { registerValidator, loginValidator } from '../validators/auth.validator.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const router = Router();

/**
 * @swagger
 * /api/auth/register:
 * post:
 * summary: Registrar un nuevo usuario
 * tags: [Autenticación]
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required:
 * - username
 * - email
 * - password
 * properties:
 * username:
 * type: string
 * email:
 * type: string
 * password:
 * type: string
 * responses:
 * 201:
 * description: Usuario creado con éxito
 * 400:
 * description: Error de validación o usuario ya existente
 */
router.post('/register', registerValidator, register);

/**
 * @swagger
 * /api/auth/login:
 * post:
 * summary: Iniciar sesión de usuario
 * tags: [Autenticación]
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required:
 * - email
 * - password
 * properties:
 * email:
 * type: string
 * password:
 * type: string
 * responses:
 * 200:
 * description: Login exitoso, devuelve el token JWT
 * 401:
 * description: Credenciales incorrectas
 */
router.post('/login', loginValidator, login);

/**
 * @swagger
 * /api/auth/profile:
 * get:
 * summary: Obtener el perfil del usuario autenticado
 * tags: [Autenticación]
 * security:
 * - bearerAuth: []
 * responses:
 * 200:
 * description: Datos del perfil obtenidos correctamente
 * 401:
 * description: Token inválido o no proporcionado
 */
router.get('/profile', authenticateToken, getProfile);

export default router;