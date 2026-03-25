const { Pool } = require('pg');

const pool = new Pool({
    user: 'admin',
    host: 'db',
    database: 'tienda_abarrotes',
    password: 'admin',
    port: 5432,
});

pool.on('error', (err, client) => {
    console.error('Error inesperado en cliente de la BD', err);
    process.exit(-1);
});

module.exports = {
    query: (text, params) => pool.query(text, params),
    obtenerCliente: () => pool.connect()
};
