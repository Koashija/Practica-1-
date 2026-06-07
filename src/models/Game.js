import mongoose from 'mongoose';

const gameSchema = new mongoose.Schema({
  room: {
    type: String,
    required: true
  },
  players: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Hace referencia al modelo User.js de arriba
    required: true
  }],
  board: {
    type: [String],
    default: Array(9).fill('') // Tablero vacío de 3x3 para el gato
  },
  turn: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['playing', 'won', 'draw'],
    default: 'playing'
  },
  winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true
});

const Game = mongoose.model('Game', gameSchema);
export default Game;