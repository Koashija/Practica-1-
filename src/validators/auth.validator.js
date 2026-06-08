import { check } from 'express-validator';

export const registerValidator = [
  check('username', 'El nombre de usuario es obligatorio.')
    .not()
    .isEmpty()
    .trim(),
  check('email', 'Por favor, proporciona un correo electrónico válido.')
    .isEmail()
    .normalizeEmail(),
  check('password', 'La contraseña debe tener una longitud mínima de 6 caracteres.')
    .isLength({ min: 6 })
];

export const loginValidator = [
  check('email', 'Por favor, proporciona un correo electrónico válido.')
    .isEmail()
    .normalizeEmail(),
  check('password', 'La contraseña de usuario es requerida para el inicio de sesión.')
    .exists()
];