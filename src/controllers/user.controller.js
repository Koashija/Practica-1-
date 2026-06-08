import User from '../models/User.js';
import Game from '../models/Game.js'; // Importamos el modelo de juego para limpiar datos

export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });
    res.json(user);
  } catch (error) { next(error); }
};

export const updateProfile = async (req, res, next) => {
  const { username, email } = req.body;
  try {
    // Validar que los campos existan
    if (!username || !email) {
      return res.status(400).json({ error: "Username y email son requeridos" });
    }

    const existing = await User.findOne({ 
      $or: [{ username }, { email }], 
      _id: { $ne: req.user.id } 
    });
    
    if (existing) {
      return res.status(400).json({ error: "El nombre de usuario o email ya están en uso" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { username, email },
      { new: true }
    ).select('-password');

    res.json(updatedUser);
  } catch (error) { next(error); }
};

export const deleteProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // 1. Eliminamos las partidas asociadas al usuario para no dejar basura en BD
    await Game.deleteMany({ players: userId });

    // 2. Eliminamos al usuario
    await User.findByIdAndDelete(userId);
    
    res.json({ msg: "Cuenta y datos asociados eliminados correctamente" });
  } catch (error) { next(error); }
};