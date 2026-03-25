-- init.sql
CREATE TABLE productos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    cantidad INTEGER DEFAULT 0,
    precio NUMERIC(10,2) NOT NULL
);

CREATE TABLE ventas (
    id SERIAL PRIMARY KEY,
    total NUMERIC(10,2) NOT NULL,
    pago_recibido NUMERIC(10,2) NOT NULL,
    cambio NUMERIC(10,2) NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE venta_detalles (
    id SERIAL PRIMARY KEY,
    venta_id INTEGER REFERENCES ventas(id) ON DELETE CASCADE,
    producto_id INTEGER REFERENCES productos(id),
    cantidad INTEGER NOT NULL,
    precio_unitario NUMERIC(10,2) NOT NULL,
    subtotal NUMERIC(10,2) NOT NULL
);

-- Algunos datos de prueba
INSERT INTO productos (nombre, descripcion, cantidad, precio) VALUES 
('Coca Cola 600ml', 'Refresco de cola', 50, 18.50),
('Sabritas Sal', 'Papas fritas clásicas', 30, 15.00),
('Leche entera 1L', 'Lalpura entera', 20, 25.00),
('Huevos San Juan 12pz', 'Cartón de huevos', 15, 35.00);
