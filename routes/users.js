import express from "express";
import multer from "multer";
import { v2 as cloudinary } from 'cloudinary';
import User from "../models/User.js";

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const router = express.Router();

// Usar memoria en lugar de disco
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Ruta CREATE modificada
router.post("/registro", upload.single("imagenPerfil"), async (request, response) => {
  try {
    const { nombre, correo, edad } = request.body;
    
    if (!request.file) {
      return response.status(400).json({ error: "Debes subir una imagen de perfil" });
    }

    // Subir imagen a Cloudinary
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "usuarios" },
      async (error, result) => {
        if (error) {
          return response.status(500).json({ error: "Error al subir imagen" });
        }
        
        const nuevoUsuario = new User({ 
          nombre, 
          correo, 
          edad, 
          imagenPerfil: result.secure_url 
        });
        
        await nuevoUsuario.save();
        
        response.status(201).json({
          mensaje: "Usuario registrado con éxito",
          usuario: nuevoUsuario,
        });
      }
    );
    
    uploadStream.end(request.file.buffer);
    
  } catch (error) {
    if (error.code === 11000) {
      return response.status(400).json({ error: "El correo ya está registrado" });
    }
    response.status(400).json({ error: error.message });
  }
});

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
      let uploadResult;
      try {
        uploadResult = await uploadToCloudinary(request.file.buffer);
      } catch (uploadError) {
        console.error("Error subiendo imagen:", uploadError);
        return response.status(500).json({ 
          error: "Error al subir la imagen. Intenta con otra imagen." 
        });
      }
      
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
        try {
          const uploadResult = await uploadToCloudinary(request.file.buffer);
          updates.imagenPerfil = uploadResult.secure_url;
        } catch (uploadError) {
          console.error("Error subiendo nueva imagen:", uploadError);
          return response.status(500).json({ 
            error: "Error al subir la nueva imagen. Intenta con otra imagen." 
          });
        }
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