import { body, validationResult } from 'express-validator';

// Middleware interceptor para evaluar las reglas de express-validator
const validateResults = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

export const registerValidator = [
  body('username')
    .trim()
    .notEmpty().withMessage('El nombre de usuario es obligatorio.')
    .isLength({ min: 3 }).withMessage('El nombre de usuario debe tener al menos 3 caracteres.'),
  body('email')
    .trim()
    .isEmail().withMessage('Debe proporcionar un correo electrónico válido.')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres.'),
  validateResults
];

export const loginValidator = [
  body('email')
    .trim()
    .isEmail().withMessage('Debe proporcionar un correo electrónico válido.')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('La contraseña es obligatoria.'),
  validateResults
];