import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';

// IMPORTANTE: Todos llevan .js al final de forma obligatoria
import { connectDB } from './src/config/db.js'; 
import { swaggerSpec } from './src/config/swagger.js';
import authRoutes from './src/routes/auth.routes.js';
import gameRoutes from './src/routes/game.routes.js';
import { handleSocketConnections } from './src/sockets/game.socket.js';
import { errorHandler } from './src/middlewares/error.middleware.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Conexión a MongoDB Atlas
connectDB();

// Middlewares globales
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Registro de rutas
app.use('/api/auth', authRoutes);
app.use('/api/game', gameRoutes);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Sockets
handleSocketConnections(io);

// Manejador de errores global
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Servidor de producción ejecutándose en el puerto ${PORT}`);
  //console.log(`Documentación API disponible en http://localhost:${PORT}/docs`);
}); 