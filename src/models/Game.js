import mongoose from 'mongoose';

const GameSchema = new mongoose.Schema({
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Sala', required: true },
  players: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  board: { type: [String], default: Array(9).fill('') },
  turn: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  playerX: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  playerO: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  winner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  status: {
    type: String,
    enum: ['playing', 'won', 'draw', 'abandoned'],
    default: 'playing'
  },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Game', GameSchema);