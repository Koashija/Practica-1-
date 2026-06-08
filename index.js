import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import connectDB from './src/config/db.js';
import swaggerDocs from './src/config/swagger.js';
import errorMiddleware from './src/middlewares/error.middleware.js';

// Importación de rutas (Obligatorio usar .js en ES Modules)
import authRoutes from './src/routes/auth.routes.js';
import userRoutes from './src/routes/user.routes.js';
import gameRoutes from './src/routes/game.routes.js';

const app = express();

// Middlewares globales externos
app.use(cors());
app.use(express.json());

// Conexión a la Base de Datos MongoDB Atlas
connectDB();

// Configuración de la documentación Swagger
swaggerDocs(app);

// Definición de las rutas del aplicativo
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/game', gameRoutes);

// Middleware centralizado para el manejo de errores
app.use(errorMiddleware);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor de la API corriendo correctamente en el puerto: ${PORT}`);
  console.log(`Documentación de Swagger disponible en: http://localhost:${PORT}/api-docs`);
});