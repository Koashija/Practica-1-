import mongoose from 'mongoose';

const GameSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  result: {
    type: String,
    enum: ['victoria', 'derrota', 'empate'],
    required: true
  },
  playedAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Game', GameSchema);