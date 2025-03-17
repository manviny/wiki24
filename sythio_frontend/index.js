const express = require('express');
const queries = require('queries');

// Crear una sesión para interactuar con la base de datos
const session = new queries.Session("postgresql://manol:Manol.13@localhost:5432/sityo");

const app = express();
const PORT = 3000;

// Middleware para parsear JSON
app.use(express.json());

// Ruta para recibir mensajes y guardarlos en la base de datos
app.post('/mensaje', async (req, res) => {
    try {
        const { texto, latitud, longitud } = req.body;
        await session.query(`
            INSERT INTO mensajes (texto, latitud, longitud)
            VALUES ($1, $2, $3);
        `, [texto, latitud, longitud]);
        res.status(201).send("Mensaje guardado con éxito");
    } catch (error) {
        console.error("Error al guardar el mensaje:", error);
        res.status(500).send("Error al procesar la solicitud");
    }
});

// Ruta para consultar todos los mensajes
app.get('/mensajes', async (req, res) => {
    try {
        const resultados = await session.query("SELECT * FROM mensajes;");
        res.status(200).json(resultados);
    } catch (error) {
        console.error("Error al obtener los mensajes:", error);
        res.status(500).send("Error al procesar la solicitud");
    }
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});