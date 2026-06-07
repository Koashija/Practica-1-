import mongoose from 'mongoose';

// Definición del esquema del usuario para MongoDB
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'El nombre de usuario es obligatorio.'],
    unique: true,
    trim: true,
    minlength: [3, 'El nombre de usuario debe tener al menos 3 caracteres.']
  },
  email: {
    type: String,
    required: [true, 'El correo electrónico es obligatorio.'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Por favor, proporciona un correo válido.']
  },
  password: {
    type: String,
    required: [true, 'La contraseña es obligatoria.']
  },
  wins: {
    type: Number,
    default: 0
  }
}, {
  // Crea automáticamente los campos 'createdAt' y 'updatedAt' en la base de datos
  timestamps: true 
});

// Crear el modelo a partir del esquema
const User = mongoose.model('User', userSchema);

// Exportación por defecto para usarlo en controladores, validadores y sockets
export default User;