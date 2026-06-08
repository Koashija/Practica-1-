import User from '../models/User.js';

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
    const existing = await User.findOne({ $or: [{ username }, { email }], _id: { $ne: req.user.id } });
    if (existing) return res.status(400).json({ error: "El nombre de usuario o email ya están en uso" });

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
    await User.findByIdAndDelete(req.user.id);
    res.json({ msg: "Cuenta eliminada correctamente" });
  } catch (error) { next(error); }
};