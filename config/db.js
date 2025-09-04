//config/db.js
import mongoose from 'mongoose';
export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log('Mongo conectado');
  } catch (err) {
    console.error('Error:', err);
  }
};