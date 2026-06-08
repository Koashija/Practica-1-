import Game from '../models/Game.js';
import Sala from '../models/Sala.js';
import User from '../models/User.js';

export const handleSocketConnections = (io) => {
  io.on('connection', (socket) => {
    console.log(`Usuario conectado al socket: ${socket.id}`);

    // 1. INICIAR PARTIDA SÓLO CUANDO AMBOS ESTÁN LISTOS
    socket.on('iniciar_partida_lista', async (data) => {
      const { roomId, userId } = data;
      
      socket.userId = userId;
      socket.roomId = roomId;
      socket.join(roomId);

      try {
        let partida = await Game.findOne({ room: roomId });

        if (!partida) {
          const sala = await Sala.findById(roomId);
          // Aseguramos que existan ambos jugadores antes de crear el tablero
          if (sala && sala.jugador1 && sala.jugador2) {
            partida = new Game({
              room: roomId,
              players: [sala.jugador1, sala.jugador2],
              board: Array(9).fill(''),
              turn: sala.jugador1, 
              status: 'playing'
            });
            await partida.save();
            
            // Emitimos a la sala. IMPORTANTE: convertir el ObjectId a string
            io.to(roomId).emit('turno_actualizado', {
              board: partida.board,
              turn: partida.turn.toString() 
            });
          }
        } else {
          // Si la partida ya existía, mandamos el estado actual
          socket.emit('turno_actualizado', {
            board: partida.board,
            turn: partida.turn.toString()
          });
        }
      } catch (error) {
        console.error('Error al iniciar partida en sockets:', error);
      }
    });

    // 2. EVENTO PARA EL BOTÓN DE ABANDONAR
    socket.on('abandonar_partida_manual', async (data) => {
      const { roomId } = data;
      if (roomId) {
        // Le gritamos a todos en el cuarto (el rival) que la partida se canceló
        socket.broadcast.to(roomId).emit('jugador_desconectado');
        
        // Limpiamos Mongo por seguridad
        await Sala.findByIdAndUpdate(roomId, { estado: 'terminado' });
        await Game.findOneAndUpdate({ room: roomId }, { status: 'abandoned' });
      }
    });

    // 3. MOVIMIENTO (Mantenemos tu lógica actual de movimientos)
    socket.on('movimiento', async (data) => {
      const { roomId, index, playerSymbol } = data;

      try {
        const game = await Game.findOne({ room: roomId, status: 'playing' });
        if (!game) return;

        const rivalId = game.players.find(id => id.toString() !== game.turn.toString());
        game.board[index] = playerSymbol;
        
        const ganadorSimbolo = checkWinnerStatus(game.board);
        if (ganadorSimbolo) {
          game.status = 'won';
          game.winner = game.turn; 
          await game.save();

          await User.findByIdAndUpdate(game.turn, { $inc: { "stats.wins": 1, "stats.gamesPlayed": 1 } });
          await User.findByIdAndUpdate(rivalId, { $inc: { "stats.losses": 1, "stats.gamesPlayed": 1 } });
          await Sala.findByIdAndUpdate(roomId, { estado: 'terminado' });

          io.to(roomId).emit('turno_actualizado', { board: game.board, turn: '' });
          io.to(roomId).emit('partida_finalizada', { winnerId: game.winner, isDraw: false });
          return;
        }

        if (game.board.every(cell => cell !== '')) {
          game.status = 'draw';
          await game.save();

          await User.updateMany({ _id: { $in: game.players } }, { $inc: { "stats.draws": 1, "stats.gamesPlayed": 1 } });
          await Sala.findByIdAndUpdate(roomId, { estado: 'terminado' });

          io.to(roomId).emit('turno_actualizado', { board: game.board, turn: '' });
          io.to(roomId).emit('partida_finalizada', { winnerId: null, isDraw: true });
          return;
        }

        game.turn = rivalId;
        await game.save();

        io.to(roomId).emit('turno_actualizado', {
          board: game.board,
          turn: game.turn.toString() // Siempre a string
        });

      } catch (error) {
        console.error('Error en movimiento:', error);
      }
    });

    socket.on('disconnect', async () => {
      // Lógica nativa de desconexión por pérdida de red
      // ... manten tu código de desconexión aquí
    });
  });
};

const checkWinnerStatus = (currentBoard) => {
  const lines = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
  for (const line of lines) {
    const [a, b, c] = line;
    if (currentBoard[a] && currentBoard[a] === currentBoard[b] && currentBoard[a] === currentBoard[c]) return currentBoard[a];
  }
  return null;
};