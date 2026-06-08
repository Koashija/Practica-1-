import express from 'express';
import { register, login } from '../controllers/auth.controller.js';
import { registerValidator, loginValidator } from '../validators/auth.validator.js';

const router = express.Router();

/**
 * @swagger
 * /api/auth/register:
 * post:
 * summary: Registra un nuevo usuario en la aplicación
 * tags:
 * - Auth
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
 * example: dev_senior
 * email:
 * type: string
 * example: senior@example.com
 * password:
 * type: string
 * example: contrasenia123
 * responses:
 * 201:
 * description: Usuario registrado de manera exitosa y token generado.
 * 400:
 * description: Error en los campos enviados o usuario ya registrado.
 */
router.post('/register', registerValidator, register);

/**
 * @swagger
 * /api/auth/login:
 * post:
 * summary: Inicia sesión con una cuenta existente
 * tags:
 * - Auth
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
 * example: senior@example.com
 * password:
 * type: string
 * example: contrasenia123
 * responses:
 * 200:
 * description: Login exitoso, devuelve los datos públicos del usuario y el JWT.
 * 400:
 * description: Parámetros incorrectos o credenciales no válidas.
 */
router.post('/login', loginValidator, login);

export default router;