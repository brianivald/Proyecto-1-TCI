const express = require('express');
const router = express.Router();
const prodCtrl = require('../controladores/productos');

router.get('/', prodCtrl.obtenerProductos);
router.post('/', prodCtrl.crearProducto);
router.put('/:id', prodCtrl.actualizarProducto);
router.delete('/:id', prodCtrl.eliminarProducto);

module.exports = router;
