// Importamos las dependencias necesarias
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const cors = require('cors');

// Inicializamos el servidor Express
const app = express();

// Configuramos middleware
app.use(cors());
app.use(bodyParser.json());

// Conexión a la base de datos MongoDB (usa tu URI de MongoDB Atlas)
mongoose.connect('mongodb+srv://Programadorex:Cd5DHj_-nU3FtMP@cluster0.bnjqv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', { 
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("Conectado a la base de datos MongoDB Atlas");
}).catch(err => {
    console.error("Error al conectar con MongoDB:", err);
});

// Definimos el esquema y modelo de Usuario para la base de datos
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);

// Ruta básica para verificar que el servidor está funcionando
app.get('/', (req, res) => {
    res.send('¡Servidor funcionando correctamente!');
});

// Ruta para registrar un nuevo usuario
app.post('/registrar', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Verificar si el correo ya existe
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'El correo ya está registrado', success: false });
        }

        // Encriptar la contraseña antes de guardarla
        const hashedPassword = await bcrypt.hash(password, 10);

        // Crear un nuevo usuario en la base de datos
        const newUser = new User({
            email,
            password: hashedPassword
        });

        // Guardar el usuario
        await newUser.save();

        res.status(201).json({ message: 'Usuario registrado exitosamente', success: true });
    } catch (err) {
        console.error("Error al registrar usuario:", err);
        res.status(500).json({ message: 'Error al registrar el usuario', success: false });
    }
});

// Ruta para verificar las credenciales de inicio de sesión
app.post('/verificar-correo', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Buscar el usuario por correo
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Correo no encontrado', success: false });
        }

        // Verificar la contraseña usando bcrypt
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Contraseña incorrecta', success: false });
        }

        // Si la contraseña es correcta
        res.status(200).json({ message: 'Login exitoso', success: true });
    } catch (err) {
        console.error("Error al verificar correo:", err);
        res.status(500).json({ message: 'Error al verificar el correo', success: false });
    }
});

// Definir el puerto donde se ejecutará el servidor
const PORT = 8080;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
