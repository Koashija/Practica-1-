import Game from '../models/Game.js';
import Sala from '../models/Sala.js';
import User from '../models/User.js';

const checkWinnerStatus = (currentBoard) => {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];
  for (const line of lines) {
    const [a, b, c] = line;
    if (currentBoard[a] && currentBoard[a] === currentBoard[b] && currentBoard[a] === currentBoard[c]) {
      return currentBoard[a];
    }
  }
  return null;
};

export const handleSocketConnections = (io) => {
  io.on('connection', (socket) => {
    console.log(`Usuario conectado al socket: ${socket.id}`);

    // 1. INICIAR PARTIDA CUANDO AMBOS ESTÁN LISTOS
    socket.on('iniciar_partida_lista', async (data) => {
      const { roomId, userId } = data;

      socket.userId = userId;
      socket.roomId = roomId;
      socket.join(roomId);

      console.log(`[Socket] Usuario ${userId} se unió a sala ${roomId}`);

      try {
        // Buscar o crear partida
        let partida = await Game.findOne({ room: roomId });

        if (!partida) {
          const sala = await Sala.findById(roomId);
          if (sala && sala.jugador1 && sala.jugador2) {
            partida = new Game({
              room: roomId,
              players: [sala.jugador1, sala.jugador2],
              board: Array(9).fill(''),
              turn: sala.jugador1,
              playerX: sala.jugador1,
              playerO: sala.jugador2,
              status: 'playing'
            });
            await partida.save();
            console.log(`[Socket] Nueva partida creada en sala ${roomId}`);
          } else {
            console.log('[Socket] Sala no tiene ambos jugadores aún');
            return;
          }
        }

        // Enviar estado actual a TODOS en la sala
        io.to(roomId).emit('turno_actualizado', {
          board: partida.board,
          turn: partida.turn.toString(),
          playerX: partida.playerX?.toString(),
          playerO: partida.playerO?.toString()
        });
      } catch (error) {
        console.error('[Socket] Error al iniciar partida:', error);
      }
    });

    // 2. ABANDONO MANUAL DE PARTIDA
    socket.on('abandonar_partida_manual', async (data) => {
      const { roomId, userId } = data;
      console.log(`[Socket] Usuario ${userId} abandonó la sala ${roomId}`);

      if (roomId) {
        // Notificar al rival
        socket.broadcast.to(roomId).emit('jugador_desconectado');

        // Limpiar en MongoDB
        try {
          await Sala.findByIdAndUpdate(roomId, { estado: 'terminado' });
          await Game.findOneAndUpdate({ room: roomId }, { status: 'abandoned' });
        } catch (error) {
          console.error('[Socket] Error al limpiar sala abandonada:', error);
        }
      }
    });

    // 3. MOVIMIENTO DE JUGADOR
    socket.on('movimiento', async (data) => {
      const { roomId, index, playerId } = data;

      try {
        const game = await Game.findOne({ room: roomId, status: 'playing' });
        if (!game) {
          console.log('[Socket] Partida no encontrada o ya terminada');
          return;
        }

        // Verificar que sea el turno del jugador
        if (game.turn.toString() !== playerId) {
          console.log(`[Socket] No es el turno de ${playerId}. Turno actual: ${game.turn}`);
          return;
        }

        // Verificar que la celda esté vacía
        if (game.board[index] !== '') {
          console.log('[Socket] Celda ya ocupada');
          return;
        }

        // Determinar símbolo del jugador
        const playerSymbol = game.playerX?.toString() === playerId ? 'X' : 'O';
        game.board[index] = playerSymbol;

        // Encontrar ID del rival
        const rivalId = game.players.find(id => id.toString() !== playerId);

        // Verificar ganador
        const winnerSymbol = checkWinnerStatus(game.board);

        if (winnerSymbol) {
          // Hay ganador
          const winnerId = winnerSymbol === 'X' ? game.playerX : game.playerO;
          game.status = 'won';
          game.winner = winnerId;
          await game.save();

          // Actualizar estadísticas
          await User.findByIdAndUpdate(winnerId, { $inc: { 'stats.wins': 1, 'stats.gamesPlayed': 1 } });
          await User.findByIdAndUpdate(rivalId, { $inc: { 'stats.losses': 1, 'stats.gamesPlayed': 1 } });
          await Sala.findByIdAndUpdate(roomId, { estado: 'terminado' });

          io.to(roomId).emit('partida_finalizada', {
            winnerId: winnerId.toString(),
            isDraw: false
          });
          return;
        }

        // Verificar empate
        if (game.board.every(cell => cell !== '')) {
          game.status = 'draw';
          await game.save();

          await User.updateMany(
            { _id: { $in: game.players } },
            { $inc: { 'stats.draws': 1, 'stats.gamesPlayed': 1 } }
          );
          await Sala.findByIdAndUpdate(roomId, { estado: 'terminado' });

          io.to(roomId).emit('partida_finalizada', {
            winnerId: null,
            isDraw: true
          });
          return;
        }

        // Cambiar turno al rival
        game.turn = rivalId;
        await game.save();

        io.to(roomId).emit('turno_actualizado', {
          board: game.board,
          turn: game.turn.toString(),
          playerX: game.playerX?.toString(),
          playerO: game.playerO?.toString()
        });
      } catch (error) {
        console.error('[Socket] Error en movimiento:', error);
      }
    });

    // 4. DESCONEXIÓN POR PÉRDIDA DE RED
    socket.on('disconnect', async () => {
      console.log(`[Socket] Usuario desconectado: ${socket.id}`);

      const { userId, roomId } = socket;

      if (roomId && userId) {
        try {
          const game = await Game.findOne({ room: roomId, status: 'playing' });

          if (game) {
            // Notificar al rival
            socket.broadcast.to(roomId).emit('jugador_desconectado');

            // Actualizar estado en BD
            await Sala.findByIdAndUpdate(roomId, { estado: 'terminado' });
            game.status = 'abandoned';
            await game.save();

            console.log(`[Socket] Sala ${roomId} marcada como abandonada`);
          }
        } catch (error) {
          console.error('[Socket] Error en disconnect:', error);
        }
      }
    });
  });
};