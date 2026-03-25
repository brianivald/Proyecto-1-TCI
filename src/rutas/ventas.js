const express = require('express');
const router = express.Router();
const ventasCtrl = require('../controladores/ventas');

router.get('/', ventasCtrl.obtenerVentas);
router.post('/', ventasCtrl.crearVenta);
router.delete('/:id', ventasCtrl.eliminarVenta);

module.exports = router;
