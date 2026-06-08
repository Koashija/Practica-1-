import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Acceso denegado. Token no proporcionado.' });
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    req.user = user;
    next(); // Solo llamamos a next si el token es válido
  } catch (err) {
    return res.status(403).json({ message: 'Token inválido o expirado.' });
  }
};