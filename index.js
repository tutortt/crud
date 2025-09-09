import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './config/db.js';
import userRoutes from './routes/users.js';

dotenv.config({ debug: false });
await connectDB();

// Configurar __dirname para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Configurar Content Security Policy para Vercel
app.use((req, res, next) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const baseUrl = isProduction ? 'https://crud-psi-nine.vercel.app' : 'http://localhost:' + process.env.PORT;
  
  res.setHeader('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: blob: " + baseUrl + "; " +
    "font-src 'self'; " +
    "connect-src 'self' " + baseUrl + "; " +
    "media-src 'self'; " +
    "object-src 'none'; " +
    "child-src 'none'; " +
    "frame-src 'none'; " +
    "worker-src 'self'; " +
    "form-action 'self'; " +
    "base-uri 'self'; " +
    "manifest-src 'self'"
  );
  next();
});

// Configurar CORS para Vercel
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://crud-psi-nine.vercel.app', 'https://*.vercel.app']
    : true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api', userRoutes);

// Ruta para servir el frontend en Vercel
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(process.env.PORT, () =>
  console.log(`Servidor en http://localhost:${process.env.PORT}`));