// Archivo: C:\Users\sanch\Downloads\Vinicio\api\api\src\config\db.js
import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || '');
    console.log(`MongoDB Atlas Conectado con éxito: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error crítico en la conexión a la base de datos: ${error}`);
    process.exit(1);
  }
};