const express = require('express');
const cors = require('cors');
const path = require('path');
const rutasProductos = require('./src/rutas/productos');
const rutasVentas = require('./src/rutas/ventas');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, 'public')));

// Rutas de API
app.use('/api/productos', rutasProductos);
app.use('/api/ventas', rutasVentas);

// Ruta principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor de tienda de abarrotes corriendo en http://localhost:${PORT}`);
});
