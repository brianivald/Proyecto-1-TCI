const bd = require('../configuracion/bd');

const obtenerProductos = async (req, res) => {
    try {
        const { rows } = await bd.query('SELECT * FROM productos ORDER BY id ASC');
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener productos:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

const crearProducto = async (req, res) => {
    const { nombre, descripcion, cantidad, precio } = req.body;
    try {
        const { rows } = await bd.query(
            'INSERT INTO productos (nombre, descripcion, cantidad, precio) VALUES ($1, $2, $3, $4) RETURNING *',
            [nombre, descripcion, cantidad || 0, precio]
        );
        res.status(201).json(rows[0]);
    } catch (error) {
        console.error('Error al crear producto:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

const actualizarProducto = async (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion, cantidad, precio } = req.body;
    try {
        const { rows } = await bd.query(
            'UPDATE productos SET nombre = $1, descripcion = $2, cantidad = $3, precio = $4 WHERE id = $5 RETURNING *',
            [nombre, descripcion, cantidad, precio, id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Error al actualizar producto:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

const eliminarProducto = async (req, res) => {
    const { id } = req.params;
    try {
        const { rowCount } = await bd.query('DELETE FROM productos WHERE id = $1', [id]);
        if (rowCount === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        res.json({ mensaje: 'Producto eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar producto:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

module.exports = {
    obtenerProductos,
    crearProducto,
    actualizarProducto,
    eliminarProducto
};
