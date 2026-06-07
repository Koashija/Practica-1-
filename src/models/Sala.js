import mongoose from 'mongoose'; // Asegúrate de tener este import arriba también si usas ES6

const SalaSchema = new mongoose.Schema({
  jugador1: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  jugador2: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  estado: { type: String, enum: ['esperando', 'jugando', 'terminado'], default: 'esperando' },
  createdAt: { type: Date, default: Date.now, expires: 3600 }
});

// ESTA ES LA LÍNEA CLAVE: Debe llevar "export default"
export default mongoose.model('Sala', SalaSchema);