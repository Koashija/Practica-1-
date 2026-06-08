import User from '../models/User.js';

export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'El perfil de usuario solicitado no existe.' });
    }
    return res.json(user);
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { username, email, avatar } = req.body;

    if (email || username) {
      const query = [];
      if (email) query.push({ email });
      if (username) query.push({ username });

      const existingUser = await User.findOne({
        $and: [
          { _id: { $ne: req.user.id } },
          { $or: query }
        ]
      });

      if (existingUser) {
        return res.status(400).json({ message: 'El nombre de usuario o email ya se encuentra en uso.' });
      }
    }

    const updatedFields = {};
    if (username) updatedFields.username = username;
    if (email) updatedFields.email = email;
    if (avatar) updatedFields.avatar = avatar;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updatedFields },
      { new: true, runValidators: true }
    ).select('-password');

    return res.json(updatedUser);
  } catch (error) {
    next(error);
  }
};