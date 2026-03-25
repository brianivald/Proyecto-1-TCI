// Lógica Frontend Tienda de Abarrotes

let productosG = [];
let ventasG = [];
let carritoG = [];
const API_BASE = '/api';

// Navegación
const enlaceVentas = document.getElementById('link-ventas');
const enlaceProductos = document.getElementById('link-productos');
const vistaVentas = document.getElementById('vista-ventas');
const vistaProductos = document.getElementById('vista-productos');

enlaceVentas.addEventListener('click', () => {
    vistaVentas.classList.add('activa');
    vistaProductos.classList.remove('activa');
    enlaceVentas.classList.add('active');
    enlaceProductos.classList.remove('active');
    cargarProductos();
});

enlaceProductos.addEventListener('click', () => {
    vistaProductos.classList.add('activa');
    vistaVentas.classList.remove('activa');
    enlaceProductos.classList.add('active');
    enlaceVentas.classList.remove('active');
    cargarProductosTabla();
    cargarVentasTabla();
});

// ======================== VENTAS =========================
async function cargarProductos() {
    try {
        const respuesta = await fetch(`${API_BASE}/productos`);
        productosG = await respuesta.json();
        renderizarProductosVenta();
    } catch (error) { console.error('Error cargando productos', error); }
}

function renderizarProductosVenta() {
    const contenedor = document.getElementById('contenedor-productos-venta');
    contenedor.innerHTML = '';
    productosG.forEach(p => {
        const div = document.createElement('div');
        div.className = 'tarjeta-producto';
        div.innerHTML = `
            <h4>${p.nombre}</h4>
            <p>ID: ${p.id} | Stock: ${p.cantidad}</p>
            <div class="precio-tag">$${p.precio}</div>
            <button class="btn-primario btn-icono" onclick="agregarAlCarrito(${p.id})" ${p.cantidad <= 0 ? 'disabled' : ''}>+</button>
        `;
        contenedor.appendChild(div);
    });
}

function agregarAlCarrito(idProducto) {
    const prod = productosG.find(p => p.id === idProducto);
    if (!prod || prod.cantidad <= 0) return;

    const itemEnCarrito = carritoG.find(i => i.producto_id === idProducto);
    if (itemEnCarrito) {
        if(itemEnCarrito.cantidad < prod.cantidad) {
            itemEnCarrito.cantidad++;
            itemEnCarrito.subtotal = itemEnCarrito.cantidad * itemEnCarrito.precio_unitario;
        } else {
            alert('No hay suficiente stock');
        }
    } else {
        carritoG.push({
            producto_id: prod.id,
            nombre: prod.nombre,
            cantidad: 1,
            precio_unitario: prod.precio,
            subtotal: prod.precio
        });
    }
    renderizarCarrito();
}

function removerDelCarrito(idProducto) {
    carritoG = carritoG.filter(i => i.producto_id !== idProducto);
    renderizarCarrito();
}

function renderizarCarrito() {
    const contenedor = document.getElementById('contenedor-carrito');
    contenedor.innerHTML = '';
    let total = 0;

    carritoG.forEach(item => {
        total += Number(item.subtotal);
        const div = document.createElement('div');
        div.className = 'item-carrito';
        div.innerHTML = `
            <div class="item-detalles">
                <strong>${item.nombre} (x${item.cantidad})</strong><br>
                <span>Subtotal: $${item.subtotal}</span>
            </div>
            <button class="item-carrito-btn" onclick="removerDelCarrito(${item.producto_id})">&times;</button>
        `;
        contenedor.appendChild(div);
    });

    document.getElementById('total-venta').innerText = total.toFixed(2);
    document.getElementById('btn-confirmar-compra').disabled = carritoG.length === 0;
}

// Modal Pago
const modalPago = document.getElementById('modal-pago');
const btnConfirmar = document.getElementById('btn-confirmar-compra');
const cerrarModal = document.querySelector('.cerrar');
const inputDinero = document.getElementById('input-dinero');
const btnProcesar = document.getElementById('btn-procesar-pago');
let totalCobrar = 0;

btnConfirmar.addEventListener('click', () => {
    totalCobrar = carritoG.reduce((acc, item) => acc + Number(item.subtotal), 0);
    document.getElementById('modal-total').innerText = totalCobrar.toFixed(2);
    inputDinero.value = '';
    document.getElementById('modal-cambio').innerText = '0.00';
    modalPago.style.display = 'block';
});

cerrarModal.addEventListener('click', () => modalPago.style.display = 'none');

inputDinero.addEventListener('input', (e) => {
    const dinero = parseFloat(e.target.value) || 0;
    const cambio = dinero - totalCobrar;
    document.getElementById('modal-cambio').innerText = cambio >= 0 ? cambio.toFixed(2) : '0.00';
});

btnProcesar.addEventListener('click', async () => {
    const dinero = parseFloat(inputDinero.value);
    if(isNaN(dinero) || dinero < totalCobrar) {
        alert('El dinero recibido es insuficiente.');
        return;
    }
    
    const cambio = dinero - totalCobrar;
    const items = carritoG.map(i => ({
        producto_id: i.producto_id,
        cantidad: i.cantidad,
        precio_unitario: i.precio_unitario,
        subtotal: i.subtotal
    }));

    try {
        const respuesta = await fetch(`${API_BASE}/ventas`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                total: totalCobrar,
                pago_recibido: dinero,
                cambio: cambio,
                items: items
            })
        });
        
        if (respuesta.ok) {
            alert(`COMPRA EXITOSA\nTotal: $${totalCobrar}\nRecibido: $${dinero}\nCambio: $${cambio}`);
            carritoG = [];
            renderizarCarrito();
            modalPago.style.display = 'none';
            cargarProductos(); // Actualizar stock
        } else {
            alert('Error al registrar la venta');
        }
    } catch (error) {
        console.error('Error procesando pago', error);
    }
});

// ======================== PRODUCTOS =========================
async function cargarProductosTabla() {
    try {
        const res = await fetch(`${API_BASE}/productos`);
        const prods = await res.json();
        const tbody = document.querySelector('#tabla-productos tbody');
        tbody.innerHTML = '';
        prods.forEach(p => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${p.id}</td>
                <td>${p.nombre}</td>
                <td>${p.descripcion || ''}</td>
                <td>${p.cantidad}</td>
                <td>$${p.precio}</td>
                <td>
                    <button class="btn-secundario" onclick="editarProducto(${p.id}, '${p.nombre}', '${p.descripcion}', ${p.cantidad}, ${p.precio})">Editar</button>
                    <button class="btn-peligro" onclick="borrarProducto(${p.id})">Eliminar</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch(e) { console.error('Error', e); }
}

async function cargarVentasTabla() {
    try {
        const res = await fetch(`${API_BASE}/ventas`);
        const ventas = await res.json();
        const tbody = document.querySelector('#tabla-ventas tbody');
        tbody.innerHTML = '';
        ventas.forEach(v => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${v.id}</td>
                <td>${new Date(v.fecha).toLocaleString()}</td>
                <td>$${v.total}</td>
                <td>$${v.pago_recibido}</td>
                <td>$${v.cambio}</td>
                <td>
                    <button class="btn-peligro" onclick="borrarVenta(${v.id})">Anular Mvmt</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch(e) { console.error('Error', e); }
}

const formProd = document.getElementById('form-producto');
const btnCancelar = document.getElementById('btn-cancelar-edicion');
const prodIdInput = document.getElementById('producto-id');

formProd.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = prodIdInput.value;
    const payload = {
        nombre: document.getElementById('producto-nombre').value,
        descripcion: document.getElementById('producto-desc').value,
        cantidad: parseInt(document.getElementById('producto-cant').value),
        precio: parseFloat(document.getElementById('producto-precio').value)
    };

    const url = id ? `${API_BASE}/productos/${id}` : `${API_BASE}/productos`;
    const metodo = id ? 'PUT' : 'POST';

    try {
        await fetch(url, {
            method: metodo,
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(payload)
        });
        resetForm();
        cargarProductosTabla();
    } catch(e) { console.error(e); }
});

function editarProducto(id, nombre, desc, cant, pre) {
    prodIdInput.value = id;
    document.getElementById('producto-nombre').value = nombre;
    document.getElementById('producto-desc').value = desc !== 'null' ? desc : '';
    document.getElementById('producto-cant').value = cant;
    document.getElementById('producto-precio').value = pre;
    document.getElementById('btn-guardar-producto').innerText = "Actualizar";
    btnCancelar.classList.remove('oculto');
}

btnCancelar.addEventListener('click', () => resetForm());

function resetForm() {
    formProd.reset();
    prodIdInput.value = '';
    document.getElementById('btn-guardar-producto').innerText = "Guardar Producto";
    btnCancelar.classList.add('oculto');
}

async function borrarProducto(id) {
    if(!confirm('¿Seguro que deseas eliminar este producto?')) return;
    try {
        await fetch(`${API_BASE}/productos/${id}`, { method: 'DELETE' });
        cargarProductosTabla();
    } catch(e) { console.error(e); }
}

async function borrarVenta(id) {
    if(!confirm('¿Seguro que deseas anular esta venta? Esto restaurará el stock de los productos correspondientes.')) return;
    try {
        await fetch(`${API_BASE}/ventas/${id}`, { method: 'DELETE' });
        cargarVentasTabla();
        cargarProductos(); // actualiza el stock en la otra vista también
    } catch(e) { console.error(e); }
}

// Inicializar
cargarProductos();
