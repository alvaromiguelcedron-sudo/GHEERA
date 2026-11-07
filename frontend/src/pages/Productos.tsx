
import { useEffect, useState } from "react";
import {
  Search,
  Plus,
  Package,
  Pencil,
  Trash2,
  X,
  Boxes,
  RefreshCw,
} from "lucide-react";

import {
  obtenerProductos,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
} from "../services/productoService";

import type {
  Producto,
  ProductoNuevo,
} from "../services/productoService";

import "./Productos.css";

const formularioInicial: ProductoNuevo = {
  nombre: "",
  codigo: "",
  descripcion: "",
  precioCompra: 0,
  precio: 0,
  stock: 0,
  categoria: "",
};

export default function Productos() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [productoEditando, setProductoEditando] =
    useState<Producto | null>(null);
  const [formulario, setFormulario] =
    useState<ProductoNuevo>(formularioInicial);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const cargarProductos = async () => {
    try {
      setCargando(true);
      setError("");

      const datos = await obtenerProductos();
      setProductos(datos);
    } catch (err) {
      console.error("Error al cargar productos:", err);
      setError("No se pudieron cargar los productos. Revisá que el servidor esté funcionando.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  const productosFiltrados = productos.filter((producto) => {
    const termino = busqueda.toLowerCase();

    return (
      producto.nombre.toLowerCase().includes(termino) ||
      producto.codigo.toLowerCase().includes(termino) ||
      producto.categoria.toLowerCase().includes(termino)
    );
  });

  const abrirNuevoProducto = () => {
    setProductoEditando(null);
    setFormulario(formularioInicial);
    setError("");
    setMensaje("");
    setModalAbierto(true);
  };

  const abrirEdicion = (producto: Producto) => {
    setProductoEditando(producto);

    setFormulario({
      nombre: producto.nombre,
      codigo: producto.codigo,
      descripcion: producto.descripcion || "",
      precioCompra: producto.precioCompra,
      precio: producto.precio,
      stock: producto.stock,
      categoria: producto.categoria,
    });

    setError("");
    setMensaje("");
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setProductoEditando(null);
    setFormulario(formularioInicial);
    setError("");
  };

  const manejarCambio = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setFormulario((anterior) => ({
      ...anterior,
      [name]:
        name === "precioCompra" ||
        name === "precio" ||
        name === "stock"
          ? Number(value)
          : value,
    }));
  };

  const manejarGuardado = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    try {
      setGuardando(true);
      setError("");

      if (productoEditando) {
        await actualizarProducto(productoEditando._id, formulario);
        setMensaje("Producto actualizado correctamente.");
      } else {
        await crearProducto(formulario);
        setMensaje("Producto registrado correctamente.");
      }

      cerrarModal();
      await cargarProductos();
    } catch (err: any) {
      console.error("Error al guardar producto:", err);

      if (err.response?.status === 409) {
        setError("Ese código de producto ya está registrado.");
      } else {
        setError(
          err.response?.data?.mensaje ||
          "No se pudo guardar el producto. Revisá los datos e intentá nuevamente."
        );
      }
    } finally {
      setGuardando(false);
    }
  };

  const manejarEliminacion = async (producto: Producto) => {
    const confirmar = window.confirm(
      `¿Estás seguro de eliminar el producto "${producto.nombre}"?`
    );

    if (!confirmar) return;

    try {
      setError("");
      setMensaje("");

      await eliminarProducto(producto._id);

      setMensaje("Producto eliminado correctamente.");
      await cargarProductos();
    } catch (err) {
      console.error("Error al eliminar producto:", err);
      setError("No se pudo eliminar el producto.");
    }
  };

  const formatoPrecio = (valor: number) =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 2,
    }).format(valor);

  return (
    <main className="productos-page">
      <header className="productos-header">
        <div>
          <h1>Productos</h1>
          <p>Administrá los productos de tu negocio.</p>
        </div>

        <button
          className="btn-nuevo-producto"
          onClick={abrirNuevoProducto}
          type="button"
        >
          <Plus size={20} />
          Nuevo producto
        </button>
      </header>

      <section className="productos-resumen">
        <article className="producto-resumen-card">
          <span className="producto-resumen-icono azul">
            <Package size={23} />
          </span>
          <div>
            <p>Total de productos</p>
            <h2>{productos.length}</h2>
          </div>
        </article>

        <article className="producto-resumen-card">
          <span className="producto-resumen-icono verde">
            <Boxes size={23} />
          </span>
          <div>
            <p>Unidades en stock</p>
            <h2>
              {productos.reduce(
                (total, producto) => total + producto.stock,
                0
              )}
            </h2>
          </div>
        </article>

        <article className="producto-resumen-card">
          <span className="producto-resumen-icono naranja">
            <Package size={23} />
          </span>
          <div>
            <p>Productos sin stock</p>
            <h2>
              {productos.filter((producto) => producto.stock === 0).length}
            </h2>
          </div>
        </article>
      </section>

      <section className="productos-contenido">
        <div className="productos-toolbar">
          <div>
            <h2>Listado de productos</h2>
            <p>Consultá y administrá tu inventario.</p>
          </div>

          <div className="productos-busqueda">
            <Search size={19} />
            <input
              type="text"
              placeholder="Buscar por nombre, código o categoría..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          <button
            className="btn-recargar"
            type="button"
            onClick={cargarProductos}
            title="Actualizar listado"
          >
            <RefreshCw size={19} />
          </button>
        </div>

        {mensaje && (
          <div className="productos-mensaje">
            {mensaje}
            <button type="button" onClick={() => setMensaje("")}>
              <X size={16} />
            </button>
          </div>
        )}

        {error && (
          <div className="productos-error">
            {error}
            <button type="button" onClick={() => setError("")}>
              <X size={16} />
            </button>
          </div>
        )}

        <div className="tabla-productos-contenedor">
          <table className="tabla-productos">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Código</th>
                <th>Categoría</th>
                <th>Precio compra</th>
                <th>Precio venta</th>
                <th>Stock</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {cargando ? (
                <tr>
                  <td colSpan={7} className="tabla-vacia">
                    Cargando productos...
                  </td>
                </tr>
              ) : productosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={7} className="tabla-vacia">
                    <Package size={35} />
                    <strong>
                      {busqueda
                        ? "No se encontraron productos"
                        : "Todavía no hay productos"}
                    </strong>
                    <span>
                      {busqueda
                        ? "Probá con otro nombre o código."
                        : "Registrá tu primer producto para comenzar."}
                    </span>
                  </td>
                </tr>
              ) : (
                productosFiltrados.map((producto) => (
                  <tr key={producto._id}>
                    <td>
                      <div className="producto-nombre-celda">
                        <span className="producto-mini-icono">
                          <Package size={19} />
                        </span>
                        <div>
                          <strong>{producto.nombre}</strong>
                          <span>{producto.descripcion || "Sin descripción"}</span>
                        </div>
                      </div>
                    </td>

                    <td>{producto.codigo}</td>
                    <td>
                      <span className="producto-categoria">
                        {producto.categoria}
                      </span>
                    </td>
                    <td>{formatoPrecio(producto.precioCompra)}</td>
                    <td className="precio-venta">
                      {formatoPrecio(producto.precio)}
                    </td>
                    <td>
                      <span
                        className={`producto-stock ${
                          producto.stock === 0
                            ? "sin-stock"
                            : producto.stock <= 5
                              ? "stock-bajo"
                              : "stock-disponible"
                        }`}
                      >
                        {producto.stock}
                      </span>
                    </td>
                    <td>
                      <div className="producto-acciones">
                        <button
                          type="button"
                          className="accion-editar"
                          title="Editar producto"
                          onClick={() => abrirEdicion(producto)}
                        >
                          <Pencil size={17} />
                        </button>

                        <button
                          type="button"
                          className="accion-eliminar"
                          title="Eliminar producto"
                          onClick={() => manejarEliminacion(producto)}
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="productos-pie-tabla">
          Mostrando {productosFiltrados.length} de {productos.length} productos
        </div>
      </section>

      {modalAbierto && (
        <div className="modal-producto-fondo">
          <section className="modal-producto">
            <header className="modal-producto-header">
              <div>
                <h2>
                  {productoEditando ? "Editar producto" : "Nuevo producto"}
                </h2>
                <p>
                  Completá los datos para{" "}
                  {productoEditando ? "actualizar" : "registrar"} el producto.
                </p>
              </div>

              <button
                type="button"
                onClick={cerrarModal}
                className="modal-cerrar"
                aria-label="Cerrar formulario"
              >
                <X size={22} />
              </button>
            </header>

            <form onSubmit={manejarGuardado}>
              <div className="formulario-producto">
                <div className="campo-producto">
                  <label htmlFor="nombre">Nombre del producto *</label>
                  <input
                    id="nombre"
                    name="nombre"
                    value={formulario.nombre}
                    onChange={manejarCambio}
                    placeholder="Ej: Remera deportiva"
                    required
                  />
                </div>

                <div className="campo-producto">
                  <label htmlFor="codigo">Código *</label>
                  <input
                    id="codigo"
                    name="codigo"
                    value={formulario.codigo}
                    onChange={manejarCambio}
                    placeholder="Ej: PROD001"
                    required
                  />
                </div>

                <div className="campo-producto campo-completo">
                  <label htmlFor="descripcion">Descripción</label>
                  <textarea
                    id="descripcion"
                    name="descripcion"
                    value={formulario.descripcion}
                    onChange={manejarCambio}
                    placeholder="Detalles del producto..."
                    rows={3}
                  />
                </div>

                <div className="campo-producto">
                  <label htmlFor="categoria">Categoría *</label>
                  <input
                    id="categoria"
                    name="categoria"
                    value={formulario.categoria}
                    onChange={manejarCambio}
                    placeholder="Ej: Indumentaria"
                    required
                  />
                </div>

                <div className="campo-producto">
                  <label htmlFor="stock">Stock inicial *</label>
                  <input
                    id="stock"
                    name="stock"
                    type="number"
                    min="0"
                    step="1"
                    value={formulario.stock}
                    onChange={manejarCambio}
                    required
                  />
                </div>

                <div className="campo-producto">
                  <label htmlFor="precioCompra">Precio de compra *</label>
                  <input
                    id="precioCompra"
                    name="precioCompra"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formulario.precioCompra}
                    onChange={manejarCambio}
                    required
                  />
                </div>

                <div className="campo-producto">
                  <label htmlFor="precio">Precio de venta *</label>
                  <input
                    id="precio"
                    name="precio"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formulario.precio}
                    onChange={manejarCambio}
                    required
                  />
                </div>
              </div>

              {error && <p className="formulario-error">{error}</p>}

              <footer className="modal-producto-footer">
                <button
                  type="button"
                  className="btn-cancelar"
                  onClick={cerrarModal}
                  disabled={guardando}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="btn-guardar-producto"
                  disabled={guardando}
                >
                  {guardando
                    ? "Guardando..."
                    : productoEditando
                      ? "Guardar cambios"
                      : "Registrar producto"}
                </button>
              </footer>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}
