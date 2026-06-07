const mongoose = require('mongoose');

const SalaSchema = new mongoose.Schema({
  jugador1: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  jugador2: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  estado: { type: String, enum: ['esperando', 'jugando', 'terminado'], default: 'esperando' },
  createdAt: { type: Date, default: Date.now, expires: 3600 } // La sala se borra sola en 1 hora si se olvida
});

module.exports = mongoose.model('Sala', SalaSchema);