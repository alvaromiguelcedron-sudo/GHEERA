
import { useState } from "react";
import {
  ShoppingCart,
  Search,
  Plus,
  Minus,
  Trash2,
  UserRound,
  CreditCard,
  Banknote,
  ArrowLeftRight,
  Receipt,
  CalendarDays,
  X,
} from "lucide-react";

import "./Ventas.css";

interface ProductoVenta {
  id: number;
  nombre: string;
  codigo: string;
  precio: number;
  stock: number;
}

interface ProductoCarrito extends ProductoVenta {
  cantidad: number;
}

const productosDisponibles: ProductoVenta[] = [
  { id: 1, nombre: "Remera deportiva", codigo: "REM-001", precio: 12500, stock: 20 },
  { id: 2, nombre: "Pantalón deportivo", codigo: "PAN-002", precio: 18500, stock: 12 },
  { id: 3, nombre: "Zapatillas deportivas", codigo: "ZAP-003", precio: 45000, stock: 8 },
  { id: 4, nombre: "Buzo con capucha", codigo: "BUZ-004", precio: 28000, stock: 15 },
];

const formatoPrecio = (valor: number) =>
  valor.toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  });

export default function Ventas() {
  const [busqueda, setBusqueda] = useState("");
  const [carrito, setCarrito] = useState<ProductoCarrito[]>([]);
  const [cliente, setCliente] = useState("");
  const [formaPago, setFormaPago] = useState("efectivo");
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);

  const productosFiltrados = productosDisponibles.filter((producto) =>
    `${producto.nombre} ${producto.codigo}`
      .toLowerCase()
      .includes(busqueda.toLowerCase())
  );

  const total = carrito.reduce(
    (acumulado, producto) =>
      acumulado + producto.precio * producto.cantidad,
    0
  );

  const agregarProducto = (producto: ProductoVenta) => {
    setCarrito((actual) => {
      const existente = actual.find((item) => item.id === producto.id);

      if (existente) {
        if (existente.cantidad >= producto.stock) return actual;

        return actual.map((item) =>
          item.id === producto.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      }

      return [...actual, { ...producto, cantidad: 1 }];
    });
  };

  const cambiarCantidad = (id: number, cambio: number) => {
    setCarrito((actual) =>
      actual
        .map((item) => {
          if (item.id !== id) return item;

          const nuevaCantidad = item.cantidad + cambio;

          if (nuevaCantidad < 1 || nuevaCantidad > item.stock) {
            return item;
          }

          return { ...item, cantidad: nuevaCantidad };
        })
    );
  };

  const eliminarProducto = (id: number) => {
    setCarrito((actual) => actual.filter((item) => item.id !== id));
  };

  const finalizarVenta = () => {
    if (carrito.length === 0) return;
    if (formaPago === "credito" && !cliente.trim()) return;

    setMostrarConfirmacion(true);
  };

  const limpiarVenta = () => {
    setCarrito([]);
    setCliente("");
    setFormaPago("efectivo");
    setMostrarConfirmacion(false);
  };

  return (
    <div className="ventas-page">
      <header className="ventas-header">
        <div>
          <span className="ventas-eyebrow">GESTIÓN COMERCIAL</span>
          <h1>Ventas</h1>
          <p>Registrá operaciones y administrá tus ventas.</p>
        </div>

        <div className="ventas-fecha">
          <CalendarDays size={18} />
          <span>{new Date().toLocaleDateString("es-AR")}</span>
        </div>
      </header>

      <div className="ventas-resumen">
        <div className="venta-resumen-card">
          <div className="venta-resumen-icon"><Receipt /></div>
          <div>
            <span>Ventas de hoy</span>
            <strong>—</strong>
            <small>Se mostrará al conectar el sistema</small>
          </div>
        </div>

        <div className="venta-resumen-card">
          <div className="venta-resumen-icon"><Banknote /></div>
          <div>
            <span>Total vendido hoy</span>
            <strong>—</strong>
            <small>Información pendiente de integración</small>
          </div>
        </div>

        <div className="venta-resumen-card">
          <div className="venta-resumen-icon"><ShoppingCart /></div>
          <div>
            <span>Productos en carrito</span>
            <strong>{carrito.reduce((acc, item) => acc + item.cantidad, 0)}</strong>
            <small>Unidades seleccionadas</small>
          </div>
        </div>
      </div>

      <div className="ventas-contenido">
        <section className="ventas-productos">
          <div className="ventas-seccion-titulo">
            <div>
              <h2>Seleccionar productos</h2>
              <p>Buscá y agregá productos a la venta.</p>
            </div>
            <span className="ventas-etiqueta">CATÁLOGO</span>
          </div>

          <div className="ventas-buscador">
            <Search size={19} />
            <input
              type="text"
              placeholder="Buscar por nombre o código..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          <div className="ventas-lista-productos">
            {productosFiltrados.map((producto) => (
              <article className="venta-producto-card" key={producto.id}>
                <div className="venta-producto-icon">
                  <ShoppingCart size={23} />
                </div>

                <div className="venta-producto-info">
                  <h3>{producto.nombre}</h3>
                  <span>{producto.codigo} · Stock: {producto.stock}</span>
                  <strong>{formatoPrecio(producto.precio)}</strong>
                </div>

                <button
                  className="venta-agregar-btn"
                  onClick={() => agregarProducto(producto)}
                  disabled={producto.stock === 0}
                  title="Agregar producto"
                >
                  <Plus size={19} />
                </button>
              </article>
            ))}

            {productosFiltrados.length === 0 && (
              <div className="ventas-vacio">
                No se encontraron productos.
              </div>
            )}
          </div>
        </section>

        <section className="ventas-carrito">
          <div className="ventas-seccion-titulo">
            <div>
              <h2>Nueva venta</h2>
              <p>Detalle de la operación.</p>
            </div>
            <div className="carrito-icono"><ShoppingCart size={20} /></div>
          </div>

          <div className="venta-cliente">
            <label htmlFor="cliente-venta">
              <UserRound size={16} /> Cliente
            </label>
            <input
              id="cliente-venta"
              type="text"
              placeholder="Nombre del cliente..."
              value={cliente}
              onChange={(e) => setCliente(e.target.value)}
            />
            <small>La selección de clientes se conectará con el módulo Clientes.</small>
          </div>

          <div className="carrito-lista">
            {carrito.length === 0 ? (
              <div className="carrito-vacio">
                <ShoppingCart size={35} />
                <strong>Tu carrito está vacío</strong>
                <span>Agregá productos para comenzar.</span>
              </div>
            ) : (
              carrito.map((item) => (
                <div className="carrito-item" key={item.id}>
                  <div className="carrito-item-info">
                    <strong>{item.nombre}</strong>
                    <span>{formatoPrecio(item.precio)} c/u</span>
                  </div>

                  <div className="carrito-controles">
                    <button onClick={() => cambiarCantidad(item.id, -1)}>
                      <Minus size={14} />
                    </button>
                    <span>{item.cantidad}</span>
                    <button onClick={() => cambiarCantidad(item.id, 1)}>
                      <Plus size={14} />
                    </button>
                  </div>

                  <strong className="carrito-subtotal">
                    {formatoPrecio(item.precio * item.cantidad)}
                  </strong>

                  <button
                    className="carrito-eliminar"
                    onClick={() => eliminarProducto(item.id)}
                    title="Eliminar producto"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="venta-pago">
            <h3>Forma de pago</h3>

            <div className="venta-pago-opciones">
              <button
                className={formaPago === "efectivo" ? "activo" : ""}
                onClick={() => setFormaPago("efectivo")}
              >
                <Banknote size={18} />
                Efectivo
              </button>

              <button
                className={formaPago === "transferencia" ? "activo" : ""}
                onClick={() => setFormaPago("transferencia")}
              >
                <ArrowLeftRight size={18} />
                Transferencia
              </button>

              <button
                className={formaPago === "credito" ? "activo" : ""}
                onClick={() => setFormaPago("credito")}
              >
                <CreditCard size={18} />
                A crédito
              </button>
            </div>

            {formaPago === "credito" && (
              <div className="venta-aviso-credito">
                <CreditCard size={17} />
                El cliente debe tener una cuenta corriente registrada.
              </div>
            )}
          </div>

          <div className="venta-total">
            <span>Total de la venta</span>
            <strong>{formatoPrecio(total)}</strong>
          </div>

          <button
            className="venta-finalizar-btn"
            onClick={finalizarVenta}
            disabled={carrito.length === 0}
          >
            <Receipt size={19} />
            Registrar venta
          </button>
        </section>
      </div>

      <section className="ventas-historial">
        <div className="ventas-seccion-titulo">
          <div>
            <h2>Historial de ventas</h2>
            <p>Consultá las operaciones registradas.</p>
          </div>
          <span className="ventas-etiqueta">ÚLTIMAS OPERACIONES</span>
        </div>

        <div className="ventas-tabla-vacia">
          <Receipt size={30} />
          <strong>Historial pendiente de integración</strong>
          <span>Las ventas aparecerán aquí cuando conectemos el backend.</span>
        </div>
      </section>

      {mostrarConfirmacion && (
        <div className="venta-modal-fondo">
          <div className="venta-modal">
            <button
              className="venta-modal-cerrar"
              onClick={() => setMostrarConfirmacion(false)}
            >
              <X size={20} />
            </button>

            <div className="venta-modal-icono">
              <Receipt size={27} />
            </div>

            <h2>Venta preparada</h2>
            <p>
              La operación está lista para registrar. La confirmación real
              estará disponible cuando conectemos el backend.
            </p>

            <div className="venta-modal-total">
              Total: <strong>{formatoPrecio(total)}</strong>
            </div>

            <button
              className="venta-finalizar-btn"
              onClick={limpiarVenta}
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
