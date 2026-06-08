import Game from '../models/Game.js';
import User from '../models/User.js';
import Sala from '../models/Sala.js'; // Importamos tu modelo de salas HTTP

export const handleSocketConnections = (io) => {
  io.on('connection', (socket) => {
    console.log(`Usuario conectado al socket: ${socket.id}`);

    // 1. EVENTO CRÍTICO: El cliente se une al cuarto usando el ID de la sala de MongoDB
    socket.on('join_room_client', async (data) => {
      const { roomId } = data;
      socket.join(roomId);
      console.log(`Socket ${socket.id} se unió exitosamente al cuarto: ${roomId}`);
    });

    // 2. EVENTO: Sincronización inicial al encontrar partida por HTTP
    socket.on('buscar_partida', async (data) => {
      const { roomId, userId } = data;

      try {
        // Guardamos el userId y roomId en la sesión del socket para usarlo al desconectar
        socket.userId = userId;
        socket.roomId = roomId;

        socket.join(roomId);

        // Verificar si ya existe el registro de la partida en MongoDB para no duplicar
        let partida = await Game.findOne({ room: roomId });

        if (!partida) {
          const sala = await Sala.findById(roomId);
          if (sala && sala.jugador1 && sala.jugador2) {
            // Creamos la partida oficial en la base de datos
            partida = new Game({
              room: roomId,
              players: [sala.jugador1, sala.jugador2],
              board: Array(9).fill(''),
              turn: sala.jugador1, // Inicia el creador de la sala
              status: 'playing'
            });
            await partida.save();

            // Notificamos a la sala que la estructura de datos está lista
            io.to(roomId).emit('turno_actualizado', {
              board: partida.board,
              turn: partida.turn
            });
          }
        } else {
          // Si ya existía, simplemente le mandamos el estado actual al jugador que se reconectó
          socket.emit('turno_actualizado', {
            board: partida.board,
            turn: partida.turn
          });
        }
      } catch (error) {
        console.error('Error al iniciar/vincular partida en sockets:', error);
      }
    });

    // 3. EVENTO: Un jugador realiza un movimiento (Sincronizado con useGameLogic.ts)
    socket.on('movimiento', async (data) => {
      const { roomId, index, playerSymbol } = data;

      try {
        // Buscamos la partida activa en la base de datos
        const game = await Game.findOne({ room: roomId, status: 'playing' });
        if (!game) return;

        // Determinamos quién es el jugador rival para heredarle el turno
        const rivalId = game.players.find(id => id.toString() !== game.turn.toString());

        // Actualizamos el tablero en memoria de MongoDB
        game.board[index] = playerSymbol;
        
        // Comprobamos de manera interna si hay un ganador o un empate
        const ganadorSimbolo = checkWinnerStatus(game.board);
        
        if (ganadorSimbolo) {
          game.status = 'won';
          game.winner = game.turn; // El jugador que acaba de tirar es el ganador
          await game.save();

          // Sincronizamos las estadísticas incrementando juegos y victorias del ganador
          await User.findByIdAndUpdate(game.turn, { 
            $inc: { "stats.wins": 1, "stats.gamesPlayed": 1 } 
          });
          // Al perdedor le sumamos una derrota y juego jugado
          await User.findByIdAndUpdate(rivalId, { 
            $inc: { "stats.losses": 1, "stats.gamesPlayed": 1 } 
          });

          // Seteamos la sala HTTP como terminada
          await Sala.findByIdAndUpdate(roomId, { estado: 'terminado' });

          io.to(roomId).emit('turno_actualizado', { board: game.board, turn: '' });
          io.to(roomId).emit('partida_finalizada', { winnerId: game.winner, isDraw: false });
          return;
        }

        if (game.board.every(cell => cell !== '')) {
          game.status = 'draw';
          await game.save();

          // Incrementamos empates a ambos jugadores
          await User.updateMany({ _id: { $in: game.players } }, { 
            $inc: { "stats.draws": 1, "stats.gamesPlayed": 1 } 
          });

          await Sala.findByIdAndUpdate(roomId, { estado: 'terminado' });

          io.to(roomId).emit('turno_actualizado', { board: game.board, turn: '' });
          io.to(roomId).emit('partida_finalizada', { winnerId: null, isDraw: true });
          return;
        }

        // Si la partida continúa, cambiamos el turno al rival
        game.turn = rivalId;
        await game.save();

        // Notificamos el cambio de turno exacto a ambos dispositivos
        io.to(roomId).emit('turno_actualizado', {
          board: game.board,
          turn: game.turn
        });

      } catch (error) {
        console.error('Error procesando movimiento en socket:', error);
      }
    });

    // 4. EVENTO: Cierre forzado de partida desde la interfaz o cierre de sesión
    socket.on('disconnect', async () => {
      console.log(`Usuario desconectado de los sockets: ${socket.id}`);
      
      const { roomId, userId } = socket;

      if (roomId && userId) {
        try {
          // Buscamos si había una partida activa en esa sala
          const game = await Game.findOne({ room: roomId, status: 'playing' });
          
          if (game) {
            game.status = 'abandoned';
            // El ganador es el jugador que NO se desconectó
            const rivalId = game.players.find(id => id.toString() !== userId.toString());
            game.winner = rivalId;
            await game.save();

            // Actualizamos registros en la base de datos
            if (rivalId) {
              await User.findByIdAndUpdate(rivalId, { $inc: { "stats.wins": 1, "stats.gamesPlayed": 1 } });
              await User.findByIdAndUpdate(userId, { $inc: { "stats.losses": 1, "stats.gamesPlayed": 1 } });
            }

            // Cambiamos el estado de la sala HTTP a terminado
            await Sala.findByIdAndUpdate(roomId, { estado: 'terminado' });

            // Avisamos al jugador remanente que el rival se fue
            io.to(roomId).emit('jugador_desconectado');
          }
        } catch (error) {
          console.error('Error al limpiar partida en desconexión:', error);
        }
      }
    });
  });
};

// Función auxiliar interna para validar victorias en el Servidor
const checkWinnerStatus = (currentBoard) => {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Horizontales
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Verticales
    [0, 4, 8], [2, 4, 6]             // Diagonales
  ];
  for (const line of lines) {
    const [a, b, c] = line;
    if (currentBoard[a] && currentBoard[a] === currentBoard[b] && currentBoard[a] === currentBoard[c]) {
      return currentBoard[a];
    }
  }
  return null;
};