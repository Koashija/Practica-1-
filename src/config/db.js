import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const dbConnection = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`Conexión exitosa a MongoDB Atlas: ${dbConnection.connection.host}`);
  } catch (error) {
    console.error(`Error crítico al conectar a la base de datos: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;