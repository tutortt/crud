import express from "express";
import multer from "multer";
import { v2 as cloudinary } from 'cloudinary';
import User from "../models/User.js";

const router = express.Router();

// Configurar Cloudinary con la URL única
cloudinary.config({
  cloudinary_url: process.env.CLOUDINARY_URL
});

// Usar memoria en lugar de disco (compatible con Vercel)
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB límite
  }
});

// Función helper para subir a Cloudinary
const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { 
        folder: "usuarios",
        transformation: [
          { width: 500, height: 500, crop: "fill" }, // Optimizar tamaño
          { quality: "auto" }
        ]
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    ).end(buffer);
  });
};

//CRUD de usuarios
// Ruta CREATE para registrar nuevos usuarios
router.post(
  "/registro",
  upload.single("imagenPerfil"),
  async (request, response) => {
    try {
      const { nombre, correo, edad } = request.body;
      
      if (!request.file) {
        return response
          .status(400)
          .json({ error: "Debes subir una imagen de perfil" });
      }

      // Subir imagen a Cloudinary
      const uploadResult = await uploadToCloudinary(request.file.buffer);
      
      const nuevoUsuario = new User({ 
        nombre, 
        correo, 
        edad, 
        imagenPerfil: uploadResult.secure_url 
      });
      
      await nuevoUsuario.save();
      
      response.status(201).json({
        mensaje: "Usuario registrado con éxito",
        usuario: nuevoUsuario,
      });
    } catch (error) {
      console.error("Error en registro:", error);
      if (error.code === 11000) {
        return response
          .status(400)
          .json({ error: "El correo ya está registrado" });
      }
      response.status(400).json({ error: error.message });
    }
  }
);

// Ruta READ para obtener todos los usuarios registrados
router.get("/usuarios", async (request, response) => {
  try {
    const usuarios = await User.find().select("-__v");
    response.json(usuarios);
  } catch (error) {
    response.status(500).json({ error: "Error al obtener usuarios" });
  }
});

// Ruta READ para obtener un usuario registrado por ID
router.get("/usuarios/:id", async (request, response) => {
  try {
    const usuario = await User.findById(request.params.id);
    if (!usuario) {
      return response
        .status(404)
        .json({ error: "Usuario no encontrado con el ID proporcionado" });
    }
    response.json(usuario);
  } catch (error) {
    console.error("Error al obtener usuario:", error);
    if (error.name === "CastError") {
      return response
        .status(400)
        .json({ error: "El ID proporcionado no es válido" });
    }
    response.status(500).json({
      error: "Error interno al obtener usuario",
    });
  }
});

// Ruta UPDATE para editar un usuario registrado por ID
router.put(
  "/usuarios/:id",
  upload.single("imagenPerfil"),
  async (request, response) => {
    try {
      const updates = { ...request.body };
      
      // Si hay nueva imagen, subirla a Cloudinary
      if (request.file) {
        const uploadResult = await uploadToCloudinary(request.file.buffer);
        updates.imagenPerfil = uploadResult.secure_url;
      }
      
      const usuario = await User.findByIdAndUpdate(
        request.params.id,
        updates,
        { new: true, runValidators: true } 
      );
      
      if (!usuario) {
        return response
          .status(404)
          .json({ error: "Usuario no encontrado con el ID proporcionado" });
      }
      
      response.json({
        mensaje: "Usuario actualizado correctamente",
        usuario,
      });
    } catch (error) {
      console.error("Error al actualizar usuario:", error);
      if (error.name === "CastError") {
        return response
          .status(400)
          .json({ error: "ID de usuario no válido" });
      }
      if (error.name === "ValidationError") {
        return response
          .status(400)
          .json({ error: "Datos inválidos", detalles: error.errors });
      }
      response.status(500).json({
        error: "Error interno al actualizar usuario",
      });
    }
  }
);

// Ruta DELETE para borrar un usuario registrado por ID
router.delete("/usuarios/:id", async (request, response) => {
  try {
    const usuario = await User.findByIdAndDelete(request.params.id);
    if (!usuario) {
      return response.status(404).json({ error: "Usuario no encontrado" });
    }
    
    // Opcional: eliminar imagen de Cloudinary
    if (usuario.imagenPerfil && usuario.imagenPerfil.includes('cloudinary')) {
      const publicId = usuario.imagenPerfil.split('/').pop().split('.')[0];
      try {
        await cloudinary.uploader.destroy(`usuarios/${publicId}`);
      } catch (deleteError) {
        console.log("Error eliminando imagen de Cloudinary:", deleteError);
        // No fallas la operación si no se puede eliminar la imagen
      }
    }
    
    response.json({ mensaje: "Usuario eliminado", usuario });
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    response.status(500).json({
      error: "Ocurrió un error en el servidor",
    });
  }
});

export default router;