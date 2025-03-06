const express = require("express");
const { validatorRegister, validatorLogin } = require("../validators/auth");
const { encrypt, compare } = require("../utils/handlePassword");
const { tokenSign } = require("../utils/handleJwT");
const User = require("../models/users");  // Asegúrate de tener un modelo de usuario.
const router = express.Router();

// Registro de usuario
router.post("/register", validatorRegister, async (req, res) => {
  const { name, email, password, age } = req.body;

  // Verificar si el correo ya existe
  const userExists = await User.findOne({ email });
  if (userExists) return res.status(400).json({ error: "Usuario ya existe" });

  const hashedPassword = await encrypt(password);

  const user = new User({
    name,
    email,
    password: hashedPassword,
    age,
    role: "user"  // Puedes cambiar esto según tu lógica de roles
  });

  await user.save();

  const token = tokenSign(user);  // Crear el JWT

  res.json({ token });  // Devuelve el token al cliente
});

// Login de usuario
router.post("/login", validatorLogin, async (req, res) => {
  const { email, password } = req.body;

  // Verificar si el usuario existe
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ error: "Usuario no encontrado" });

  // Verificar la contraseña
  const isPasswordValid = await compare(password, user.password);
  if (!isPasswordValid) return res.status(400).json({ error: "Contraseña incorrecta" });

  const token = tokenSign(user);  // Crear el JWT

  res.json({ token });  // Devuelve el token al cliente
});

// Middleware de autorización
const verifyAuth = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) return res.status(403).json({ error: "Token no proporcionado" });

  const verified = verifyToken(token);
  if (!verified) return res.status(403).json({ error: "Token no válido" });

  req.user = verified;
  next();
};

// Ejemplo de ruta protegida
router.get("/profile", verifyAuth, (req, res) => {
  res.json({ message: "Acceso permitido", user: req.user });
});

module.exports = router;
