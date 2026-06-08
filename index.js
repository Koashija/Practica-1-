import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';

import { connectDB } from './src/config/db.js'; 
import { swaggerSpec } from './src/config/swagger.js';
import authRoutes from './src/routes/auth.routes.js';
import gameRoutes from './src/routes/game.routes.js';
import { errorHandler } from './src/middlewares/error.middleware.js';

dotenv.config();

const app = express();

// Conexión a MongoDB Atlas
connectDB();

// Middlewares
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Servidor funcionando' });
});

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/game', gameRoutes);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Servidor en modo LOCAL ejecutándose en el puerto ${PORT}`);
});