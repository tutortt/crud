//routes/users.js
import express from "express";
import multer from "multer";
import User from "../models/User.js";

const router = express.Router();

// configurar Multer
const storage = multer.diskStorage({
  destination: (request, file, callback) => {
    callback(null, "uploads/");
  },
  filename: (request, file, callback) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    callback(
      null,
      file.fieldname +
        "-" +
        uniqueSuffix +
        "." +
        file.originalname.split(".").pop()
    );
  },
});
const upload = multer({ storage });

//CRUD de usuarios
// Ruta CREATE para registrar nuevos usuarios
router.post(
  "/registro",
  upload.single("imagenPerfil"),
  async (request, response) => {
    try {
      const { nombre, correo, edad } = request.body;
      const imagenPerfil = request.file ? request.file.path : null;
      if (!imagenPerfil) {
        return response
          .status(400)
          .json({ error: "Debes subir una imagen de perfil" });
      }
      const nuevoUsuario = new User({ nombre, correo, edad, imagenPerfil });
      await nuevoUsuario.save();
      response.status(201).json({
        mensaje: "Usuario registrado con éxito",
        usuario: nuevoUsuario,
      });
    } catch (error) {
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
    console.error(" Error al obtener usuario:", error);
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
      if (request.file) {
        updates.imagenPerfil = request.file.path;
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
        mensaje: " Usuario actualizado correctamente",
        usuario,
      });
    } catch (error) {
      console.error(" Error al actualizar usuario:", error);
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
    response.json({ mensaje: "Usuario eliminado", usuario });
  } catch (error) {
    console.error(" Error al eliminar usuario:", error);
    response.status(500).json({
      error: "Ocurrió un error en el servidor",
    });
  }
});


export default router;
