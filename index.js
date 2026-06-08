import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectDB } from './src/config/db.js'; 
import authRoutes from './src/routes/auth.routes.js';
import gameRoutes from './src/routes/game.routes.js';
import userRoutes from './src/routes/user.routes.js'; // Nueva ruta
import { errorHandler } from './src/middlewares/error.middleware.js';

dotenv.config();
const app = express();

connectDB();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/game', gameRoutes);
app.use('/api/user', userRoutes); // Montaje

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Servidor activo en puerto ${PORT}`));