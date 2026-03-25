const bd = require('../configuracion/bd');

const obtenerVentas = async (req, res) => {
    try {
        const { rows } = await bd.query('SELECT * FROM ventas ORDER BY fecha DESC');
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener ventas:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

const crearVenta = async (req, res) => {
    const { total, pago_recibido, cambio, items } = req.body;
    // items: [{ producto_id, cantidad, precio_unitario, subtotal }]
    
    const cliente = await bd.obtenerCliente();
    try {
        await cliente.query('BEGIN'); // Iniciar transacción
        
        // 1. Insertar la venta
        const resVenta = await cliente.query(
            'INSERT INTO ventas (total, pago_recibido, cambio) VALUES ($1, $2, $3) RETURNING id, fecha',
            [total, pago_recibido, cambio]
        );
        const ventaId = resVenta.rows[0].id;
        
        // 2. Insertar detalles y actualizar inventario
        for (let item of items) {
            await cliente.query(
                'INSERT INTO venta_detalles (venta_id, producto_id, cantidad, precio_unitario, subtotal) VALUES ($1, $2, $3, $4, $5)',
                [ventaId, item.producto_id, item.cantidad, item.precio_unitario, item.subtotal]
            );
            
            await cliente.query(
                'UPDATE productos SET cantidad = cantidad - $1 WHERE id = $2',
                [item.cantidad, item.producto_id]
            );
        }
        
        await cliente.query('COMMIT'); // Confirmar transacción
        res.status(201).json({ mensaje: 'Venta registrada con éxito', ventaId });
    } catch (error) {
        await cliente.query('ROLLBACK'); // Revertir en caso de error
        console.error('Error al registrar venta:', error);
        res.status(500).json({ error: 'Error al procesar la venta. Transacción revertida.' });
    } finally {
        cliente.release();
    }
};

const eliminarVenta = async (req, res) => {
    const { id } = req.params;
    const cliente = await bd.obtenerCliente();
    try {
        await cliente.query('BEGIN');
        
        // Obtener detalles para restaurar stock
        const { rows: detalles } = await cliente.query(
            'SELECT producto_id, cantidad FROM venta_detalles WHERE venta_id = $1',
            [id]
        );
        
        // Restaurar cantidades de productos
        for (let detalle of detalles) {
            await cliente.query(
                'UPDATE productos SET cantidad = cantidad + $1 WHERE id = $2',
                [detalle.cantidad, detalle.producto_id]
            );
        }
        
        // Eliminar venta (los detalles se eliminan por CASCADE si está configurado en SQL, lo haremos manualmente por seguridad también)
        await cliente.query('DELETE FROM venta_detalles WHERE venta_id = $1', [id]);
        const { rowCount } = await cliente.query('DELETE FROM ventas WHERE id = $1', [id]);
        
        if (rowCount === 0) {
            await cliente.query('ROLLBACK');
            return res.status(404).json({ error: 'Venta no encontrada' });
        }
        
        await cliente.query('COMMIT');
        res.json({ mensaje: 'Venta eliminada y stock restaurado exitosamente' });
    } catch (error) {
        await cliente.query('ROLLBACK');
        console.error('Error al eliminar venta:', error);
        res.status(500).json({ error: 'Error interno del servidor al eliminar venta' });
    } finally {
        cliente.release();
    }
};

module.exports = {
    obtenerVentas,
    crearVenta,
    eliminarVenta
};
