const express = require('express');
const cors = require('cors');
require('dotenv').config();
const multer = require('multer');
const path = require('path');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose'); // Asegurar conexión con la DB

// Importar rutas y funciones necesarias
const routers = require('./routes');
const dbConnect = require('./config/mongo.js');
const { tokenSign, verifyToken } = require('./utils/handleJwT');
const { encrypt, compare } = require('./utils/handlePassword');
const User = require('./models/users'); // Asegurar el modelo de usuario

// Middleware de autenticación (verifica el JWT)
const customHeader = require('./middleware/customHeader'); 

// Configuración de multer para el almacenamiento de archivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads'); // Carpeta para almacenar imágenes
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Nombre único para cada archivo
  },
});
const upload = multer({ storage });

// Crear la app de Express
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads')); // Servir archivos estáticos de la carpeta uploads

// Ruta de inicio
app.get('/', (req, res) => {
  res.send('Servidor funcionando correctamente');
});

// Registro de usuario con hash de contraseña y JWT
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).send('Faltan datos');
  }

  try {
    const hashedPassword = await encrypt(password);
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: 'user',
    });

    await newUser.save(); // Guardar en DB

    const token = tokenSign(newUser);
    res.status(201).send({ token });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al registrar el usuario');
  }
});

// Inicio de sesión con validación de usuario y JWT
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send('Faltan datos');
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).send('Usuario no encontrado');
    }

    const passwordMatch = await compare(password, user.password);

    if (!passwordMatch) {
      return res.status(400).send('Contraseña incorrecta');
    }

    const token = tokenSign(user); // Generar JWT
    res.send({ token });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al iniciar sesión');
  }
});

// Ruta protegida para subir imágenes con autenticación
app.post('/api/storage/local', customHeader, verifyToken, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No se ha subido ningún archivo');
  }
  res.send({ message: 'Archivo subido correctamente', file: req.file });
});

// Ruta para verificar el token
app.get('/api/verify', verifyToken, (req, res) => {
  res.send({ message: 'Token es válido' });
});

// Rutas generales
app.use('/api', routers);

// Conexión a la base de datos y configuración del servidor
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Escuchando en el puerto ${port}`);
});

dbConnect();
