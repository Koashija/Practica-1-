import Game from '../models/Game.js';
import User from '../models/User.js';

// Cola de jugadores esperando partida en memoria RAM
let matchmakingQueue = [];

export const handleSocketConnections = (io) => {
  io.on('connection', (socket) => {
    console.log(`Usuario conectado al socket: ${socket.id}`);

    // Evento: Un jugador busca partida online
    socket.on('buscar_partida', async (data) => {
      const { userId } = data;

      try {
        const user = await User.findById(userId);
        if (!user) {
          socket.emit('error_partida', { message: 'Usuario no encontrado' });
          return;
        }

        // Evitar duplicados en la cola de espera
        if (matchmakingQueue.some(player => player.userId === userId)) {
          return;
        }

        // Agregar al jugador actual a la cola
        matchmakingQueue.push({
          userId: user._id.toString(),
          username: user.username,
          socketId: socket.id
        });

        console.log(`Jugador ${user.username} entró a la cola de espera.`);

        // Si hay al menos 2 jugadores, los emparejamos inmediatamente
        if (matchmakingQueue.length >= 2) {
          const jugador1 = matchmakingQueue.shift();
          const jugador2 = matchmakingQueue.shift();

          // Crear una sala única combinando los IDs de sus sockets
          const roomId = `room_${jugador1.socketId}_${jugador2.socketId}`;

          // Meter a ambos sockets a la sala privada
          const socket1 = io.sockets.sockets.get(jugador1.socketId);
          const socket2 = io.sockets.sockets.get(jugador2.socketId);

          if (socket1) socket1.join(roomId);
          if (socket2) socket2.join(roomId);

          // Crear el registro de la partida inicial en MongoDB
          const nuevaPartida = new Game({
            room: roomId,
            players: [jugador1.userId, jugador2.userId],
            board: Array(9).fill(''),
            turn: jugador1.userId, // Inicia el jugador 1
            status: 'playing'
          });

          await nuevaPartida.save();

          // Notificar a ambos jugadores que la partida comenzó
          io.to(roomId).emit('partida_iniciada', {
            gameId: nuevaPartida._id,
            roomId: roomId,
            players: {
              X: jugador1,
              O: jugador2
            },
            turn: jugador1.userId
          });

          console.log(`Partida creada con éxito en la sala: ${roomId}`);
        }
      } catch (error) {
        console.error('Error en el matchmaking por sockets:', error);
        socket.emit('error_partida', { message: 'Hubo un error en el servidor.' });
      }
    });

    // Evento: Un jugador realiza un movimiento en el tablero
    socket.on('realizar_movimiento', async (data) => {
      const { gameId, roomId, index, symbol, nextTurnUserId } = data;

      try {
        const game = await Game.findById(gameId);
        if (!game || game.status !== 'playing') return;

        // Actualizar el estado del tablero en la base de datos
        game.board[index] = symbol;
        game.turn = nextTurnUserId;
        await game.save();

        // Reenviar el movimiento actualizado a todos los integrantes de la sala
        io.to(roomId).emit('movimiento_actualizado', {
          board: game.board,
          turn: game.turn
        });
      } catch (error) {
        console.error('Error actualizando movimiento:', error);
      }
    });

    // Evento: Fin de la partida (Ganador o Empate)
    socket.on('terminar_partida', async (data) => {
      const { gameId, roomId, winnerId, status } = data;

      try {
        const game = await Game.findById(gameId);
        if (!game) return;

        game.status = status; // 'won' o 'draw'
        if (winnerId) {
          game.winner = winnerId;
          // Sumar una victoria al contador del usuario en la BD
          await User.findByIdAndUpdate(winnerId, { $inc: { wins: 1 } });
        }
        await game.save();

        // Notificar los resultados finales a la sala
        io.to(roomId).emit('partida_finalizada', {
          status,
          winner: winnerId
        });
      } catch (error) {
        console.error('Error al finalizar la partida:', error);
      }
    });

    // Evento: Desconexión del cliente
    socket.on('disconnect', () => {
      // Remover al jugador de la cola de espera si se desconecta antes de jugar
      matchmakingQueue = matchmakingQueue.filter(player => player.socketId !== socket.id);
      console.log(`Usuario desconectado de los sockets: ${socket.id}`);
    });
  });
};