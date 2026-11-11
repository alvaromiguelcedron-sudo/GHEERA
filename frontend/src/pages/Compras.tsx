
import { useMemo, useState } from "react";
import {
  ShoppingCart,
  Truck,
  Package,
  Search,
  Plus,
  Minus,
  Trash2,
  CalendarDays,
  Wallet,
  CreditCard,
  ArrowRight,
  CheckCircle2,
  X,
} from "lucide-react";
import "./Compras.css";

interface ProductoCompra {
  id: number;
  nombre: string;
  codigo: string;
  precioCompra: number;
  stock: number;
}

interface ItemCompra {
  producto: ProductoCompra;
  cantidad: number;
}

const productosDisponibles: ProductoCompra[] = [
  { id: 1, nombre: "Remera básica", codigo: "REM-001", precioCompra: 8500, stock: 12 },
  { id: 2, nombre: "Pantalón deportivo", codigo: "PAN-002", precioCompra: 15000, stock: 8 },
  { id: 3, nombre: "Buzo oversize", codigo: "BUZ-003", precioCompra: 22000, stock: 5 },
  { id: 4, nombre: "Zapatillas deportivas", codigo: "ZAP-004", precioCompra: 38000, stock: 3 },
  { id: 5, nombre: "Short deportivo", codigo: "SHO-005", precioCompra: 9500, stock: 15 },
  { id: 6, nombre: "Musculosa", codigo: "MUS-006", precioCompra: 7000, stock: 20 },
];

const proveedores = [
  "Seleccionar proveedor",
  "Distribuidora Central",
  "Textil del Norte",
  "Indumentaria Deportiva SRL",
];

type FormaPago = "efectivo" | "transferencia" | "pendiente";

export default function Compras() {
  const [busqueda, setBusqueda] = useState("");
  const [proveedor, setProveedor] = useState("");
  const [fecha, setFecha] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [carrito, setCarrito] = useState<ItemCompra[]>([]);
  const [formaPago, setFormaPago] = useState<FormaPago>("efectivo");
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);

  const productosFiltrados = productosDisponibles.filter((producto) => {
    const termino = busqueda.toLowerCase();
    return (
      producto.nombre.toLowerCase().includes(termino) ||
      producto.codigo.toLowerCase().includes(termino)
    );
  });

  const total = useMemo(
    () =>
      carrito.reduce(
        (acumulado, item) =>
          acumulado + item.producto.precioCompra * item.cantidad,
        0
      ),
    [carrito]
  );

  const cantidadProductos = carrito.reduce(
    (acumulado, item) => acumulado + item.cantidad,
    0
  );

  const agregarProducto = (producto: ProductoCompra) => {
    setCarrito((actual) => {
      const existente = actual.find(
        (item) => item.producto.id === producto.id
      );

      if (existente) {
        return actual.map((item) =>
          item.producto.id === producto.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      }

      return [...actual, { producto, cantidad: 1 }];
    });
  };

  const cambiarCantidad = (id: number, cambio: number) => {
    setCarrito((actual) =>
      actual
        .map((item) =>
          item.producto.id === id
            ? { ...item, cantidad: Math.max(0, item.cantidad + cambio) }
            : item
        )
        .filter((item) => item.cantidad > 0)
    );
  };

  const eliminarProducto = (id: number) => {
    setCarrito((actual) =>
      actual.filter((item) => item.producto.id !== id)
    );
  };

  const prepararCompra = () => {
    if (!proveedor || carrito.length === 0) return;
    setMostrarConfirmacion(true);
  };

  const limpiarCompra = () => {
    setCarrito([]);
    setProveedor("");
    setFormaPago("efectivo");
    setMostrarConfirmacion(false);
  };

  const formatoPrecio = (valor: number) =>
    valor.toLocaleString("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    });

  return (
    <div className="compras-page">
      <header className="compras-header">
        <div>
          <span className="compras-eyebrow">GESTIÓN COMERCIAL</span>
          <h1>Compras</h1>
          <p>Registrá las compras y controlá el ingreso de mercadería.</p>
        </div>

        <div className="compras-header-icon">
          <ShoppingCart size={25} />
        </div>
      </header>

      <section className="compras-resumen">
        <article className="compra-stat-card">
          <div className="compra-stat-icon cyan">
            <ShoppingCart size={21} />
          </div>
          <div>
            <span>Productos en compra</span>
            <strong>{cantidadProductos}</strong>
          </div>
        </article>

        <article className="compra-stat-card">
          <div className="compra-stat-icon purple">
            <Truck size={21} />
          </div>
          <div>
            <span>Proveedores disponibles</span>
            <strong>{proveedores.length - 1}</strong>
          </div>
        </article>

        <article className="compra-stat-card">
          <div className="compra-stat-icon green">
            <Wallet size={21} />
          </div>
          <div>
            <span>Total de la compra</span>
            <strong>{formatoPrecio(total)}</strong>
          </div>
        </article>
      </section>

      <div className="compras-grid">
        <section className="compras-panel productos-panel">
          <div className="compras-panel-heading">
            <div>
              <h2>Seleccionar productos</h2>
              <p>Buscá los productos que ingresarán al inventario.</p>
            </div>
            <Package size={22} />
          </div>

          <div className="compras-search">
            <Search size={18} />
            <input
              type="text"
              placeholder="Buscar por nombre o código..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          <div className="compras-productos-lista">
            {productosFiltrados.length > 0 ? (
              productosFiltrados.map((producto) => (
                <article className="compra-producto" key={producto.id}>
                  <div className="compra-producto-icon">
                    <Package size={21} />
                  </div>

                  <div className="compra-producto-info">
                    <strong>{producto.nombre}</strong>
                    <span>{producto.codigo}</span>
                    <small>Stock actual: {producto.stock} unidades</small>
                  </div>

                  <div className="compra-producto-accion">
                    <strong>{formatoPrecio(producto.precioCompra)}</strong>
                    <button
                      type="button"
                      onClick={() => agregarProducto(producto)}
                      aria-label={`Agregar ${producto.nombre}`}
                    >
                      <Plus size={17} />
                    </button>
                  </div>
                </article>
              ))
            ) : (
              <div className="compras-vacio">
                No se encontraron productos.
              </div>
            )}
          </div>
        </section>

        <section className="compras-panel detalle-compra-panel">
          <div className="compras-panel-heading">
            <div>
              <h2>Nueva compra</h2>
              <p>Completá los datos de la operación.</p>
            </div>
            <ShoppingCart size={22} />
          </div>

          <div className="compras-campos">
            <label>
              Proveedor
              <select
                value={proveedor}
                onChange={(e) => setProveedor(e.target.value)}
              >
                {proveedores.map((nombre) => (
                  <option
                    key={nombre}
                    value={nombre === "Seleccionar proveedor" ? "" : nombre}
                  >
                    {nombre}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Fecha de compra
              <div className="compra-fecha-input">
                <CalendarDays size={17} />
                <input
                  type="date"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                />
              </div>
            </label>
          </div>

          <div className="compra-carrito-heading">
            <h3>Detalle de productos</h3>
            <span>{cantidadProductos} unidades</span>
          </div>

          <div className="compra-carrito">
            {carrito.length > 0 ? (
              carrito.map((item) => (
                <article className="compra-carrito-item" key={item.producto.id}>
                  <div className="compra-carrito-info">
                    <strong>{item.producto.nombre}</strong>
                    <span>
                      {formatoPrecio(item.producto.precioCompra)} c/u
                    </span>
                  </div>

                  <div className="compra-cantidad">
                    <button
                      type="button"
                      onClick={() => cambiarCantidad(item.producto.id, -1)}
                      aria-label="Restar cantidad"
                    >
                      <Minus size={14} />
                    </button>
                    <strong>{item.cantidad}</strong>
                    <button
                      type="button"
                      onClick={() => cambiarCantidad(item.producto.id, 1)}
                      aria-label="Sumar cantidad"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <strong className="compra-subtotal">
                    {formatoPrecio(
                      item.producto.precioCompra * item.cantidad
                    )}
                  </strong>

                  <button
                    type="button"
                    className="compra-eliminar"
                    onClick={() => eliminarProducto(item.producto.id)}
                    aria-label="Eliminar producto"
                  >
                    <Trash2 size={16} />
                  </button>
                </article>
              ))
            ) : (
              <div className="compra-carrito-vacio">
                <ShoppingCart size={30} />
                <strong>Tu compra está vacía</strong>
                <span>Agregá productos desde la lista.</span>
              </div>
            )}
          </div>

          <div className="compra-pago">
            <h3>Forma de pago</h3>

            <div className="compra-pago-opciones">
              <button
                type="button"
                className={formaPago === "efectivo" ? "seleccionado" : ""}
                onClick={() => setFormaPago("efectivo")}
              >
                <Wallet size={17} />
                Efectivo
              </button>

              <button
                type="button"
                className={
                  formaPago === "transferencia" ? "seleccionado" : ""
                }
                onClick={() => setFormaPago("transferencia")}
              >
                <CreditCard size={17} />
                Transferencia
              </button>

              <button
                type="button"
                className={formaPago === "pendiente" ? "seleccionado" : ""}
                onClick={() => setFormaPago("pendiente")}
              >
                <Truck size={17} />
                Pendiente
              </button>
            </div>
          </div>

          <div className="compra-total">
            <span>Total de la compra</span>
            <strong>{formatoPrecio(total)}</strong>
          </div>

          <button
            type="button"
            className="compra-confirmar"
            disabled={!proveedor || carrito.length === 0}
            onClick={prepararCompra}
          >
            Preparar compra
            <ArrowRight size={18} />
          </button>

          <p className="compra-nota">
            Esta pantalla utiliza datos de ejemplo. La compra y el ingreso al
            stock se guardarán cuando conectemos el backend.
          </p>
        </section>
      </div>

      {mostrarConfirmacion && (
        <div
          className="compra-modal-overlay"
          onClick={() => setMostrarConfirmacion(false)}
        >
          <div
            className="compra-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="compra-modal-cerrar"
              onClick={() => setMostrarConfirmacion(false)}
              aria-label="Cerrar"
            >
              <X size={20} />
            </button>

            <div className="compra-modal-icon">
              <CheckCircle2 size={30} />
            </div>

            <h2>Compra preparada</h2>
            <p>
              La operación está lista visualmente, pero todavía no se guardó
              en la base de datos.
            </p>

            <div className="compra-modal-resumen">
              <span>Proveedor</span>
              <strong>{proveedor}</strong>
              <span>Fecha</span>
              <strong>{fecha}</strong>
              <span>Productos</span>
              <strong>{cantidadProductos} unidades</strong>
              <span>Forma de pago</span>
              <strong>
                {formaPago === "efectivo"
                  ? "Efectivo"
                  : formaPago === "transferencia"
                    ? "Transferencia"
                    : "Pendiente"}
              </strong>
              <span>Total</span>
              <strong>{formatoPrecio(total)}</strong>
            </div>

            <button
              type="button"
              className="compra-confirmar"
              onClick={limpiarCompra}
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
