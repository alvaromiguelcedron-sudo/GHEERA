
import { useMemo, useState } from "react";
import {
  Truck,
  Search,
  Plus,
  Pencil,
  Trash2,
  Eye,
  X,
  Phone,
  Mail,
  MapPin,
  Building2,
  ShoppingBag,
  CheckCircle2,
} from "lucide-react";

import "./Proveedores.css";

interface Proveedor {
  id: number;
  razonSocial: string;
  cuit: string;
  telefono: string;
  email: string;
  direccion: string;
  estado: "Activo" | "Inactivo";
  compras: number;
  totalCompras: number;
}

const proveedoresIniciales: Proveedor[] = [
  {
    id: 1,
    razonSocial: "Distribuidora Norte",
    cuit: "30-71234567-8",
    telefono: "381 555-1234",
    email: "ventas@distribuidoranorte.com",
    direccion: "San Miguel de Tucumán",
    estado: "Activo",
    compras: 15,
    totalCompras: 850000,
  },
  {
    id: 2,
    razonSocial: "Comercial Tucumán",
    cuit: "30-72345678-9",
    telefono: "381 555-2345",
    email: "contacto@comercialtucuman.com",
    direccion: "Yerba Buena",
    estado: "Activo",
    compras: 8,
    totalCompras: 420000,
  },
  {
    id: 3,
    razonSocial: "Mayorista del Sur",
    cuit: "30-73456789-0",
    telefono: "381 555-3456",
    email: "pedidos@mayoristasur.com",
    direccion: "Concepción, Tucumán",
    estado: "Inactivo",
    compras: 3,
    totalCompras: 125000,
  },
];

const formatoPrecio = (valor: number) =>
  valor.toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  });

const formularioVacio = {
  razonSocial: "",
  cuit: "",
  telefono: "",
  email: "",
  direccion: "",
  estado: "Activo" as "Activo" | "Inactivo",
};

export default function Proveedores() {
  const [proveedores, setProveedores] = useState<Proveedor[]>(proveedoresIniciales);
  const [busqueda, setBusqueda] = useState("");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [proveedorEditando, setProveedorEditando] = useState<number | null>(null);
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState<Proveedor | null>(null);
  const [formulario, setFormulario] = useState(formularioVacio);

  const proveedoresFiltrados = useMemo(
    () =>
      proveedores.filter((proveedor) =>
        `${proveedor.razonSocial} ${proveedor.cuit} ${proveedor.telefono}`
          .toLowerCase()
          .includes(busqueda.toLowerCase())
      ),
    [proveedores, busqueda]
  );

  const totalCompras = proveedores.reduce(
    (total, proveedor) => total + proveedor.totalCompras,
    0
  );

  const proveedoresActivos = proveedores.filter(
    (proveedor) => proveedor.estado === "Activo"
  ).length;

  const abrirNuevo = () => {
    setFormulario(formularioVacio);
    setProveedorEditando(null);
    setModalAbierto(true);
  };

  const abrirEdicion = (proveedor: Proveedor) => {
    setFormulario({
      razonSocial: proveedor.razonSocial,
      cuit: proveedor.cuit,
      telefono: proveedor.telefono,
      email: proveedor.email,
      direccion: proveedor.direccion,
      estado: proveedor.estado,
    });
    setProveedorEditando(proveedor.id);
    setModalAbierto(true);
  };

  const guardarProveedor = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (proveedorEditando !== null) {
      setProveedores((actuales) =>
        actuales.map((proveedor) =>
          proveedor.id === proveedorEditando
            ? { ...proveedor, ...formulario }
            : proveedor
        )
      );
    } else {
      const nuevoProveedor: Proveedor = {
        id: Date.now(),
        ...formulario,
        compras: 0,
        totalCompras: 0,
      };

      setProveedores((actuales) => [...actuales, nuevoProveedor]);
    }

    setModalAbierto(false);
    setFormulario(formularioVacio);
    setProveedorEditando(null);
  };

  const eliminarProveedor = (id: number) => {
    const confirmar = window.confirm(
      "¿Querés quitar este proveedor de la vista?"
    );

    if (confirmar) {
      setProveedores((actuales) =>
        actuales.filter((proveedor) => proveedor.id !== id)
      );
    }
  };

  return (
    <div className="proveedores-page">
      <header className="proveedores-header">
        <div>
          <span className="proveedores-eyebrow">GESTIÓN COMERCIAL</span>
          <h1>Proveedores</h1>
          <p>Administrá tus proveedores y sus datos comerciales.</p>
        </div>

        <button className="proveedor-nuevo-btn" onClick={abrirNuevo}>
          <Plus size={19} />
          Nuevo proveedor
        </button>
      </header>

      <section className="proveedores-resumen">
        <article className="proveedor-resumen-card">
          <div className="proveedor-resumen-icon"><Truck /></div>
          <div>
            <span>Total de proveedores</span>
            <strong>{proveedores.length}</strong>
            <small>Registros de ejemplo</small>
          </div>
        </article>

        <article className="proveedor-resumen-card">
          <div className="proveedor-resumen-icon"><CheckCircle2 /></div>
          <div>
            <span>Proveedores activos</span>
            <strong>{proveedoresActivos}</strong>
            <small>Disponibles para operar</small>
          </div>
        </article>

        <article className="proveedor-resumen-card">
          <div className="proveedor-resumen-icon"><ShoppingBag /></div>
          <div>
            <span>Compras acumuladas</span>
            <strong>{formatoPrecio(totalCompras)}</strong>
            <small>Importes de ejemplo</small>
          </div>
        </article>
      </section>

      <section className="proveedores-panel">
        <div className="proveedores-panel-header">
          <div>
            <h2>Directorio de proveedores</h2>
            <p>Buscá y administrá tus contactos comerciales.</p>
          </div>
          <span className="proveedores-etiqueta">DIRECTORIO</span>
        </div>

        <div className="proveedores-buscador">
          <Search size={19} />
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por razón social, CUIT o teléfono..."
          />
        </div>

        <div className="proveedores-tabla-contenedor">
          <table className="proveedores-tabla">
            <thead>
              <tr>
                <th>Proveedor</th>
                <th>CUIT</th>
                <th>Contacto</th>
                <th>Compras</th>
                <th>Total comprado</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {proveedoresFiltrados.map((proveedor) => (
                <tr key={proveedor.id}>
                  <td>
                    <div className="proveedor-identidad">
                      <div className="proveedor-avatar">
                        <Building2 size={18} />
                      </div>
                      <div>
                        <strong>{proveedor.razonSocial}</strong>
                        <small>{proveedor.direccion || "Sin dirección"}</small>
                      </div>
                    </div>
                  </td>

                  <td>{proveedor.cuit || "Sin CUIT"}</td>

                  <td>
                    <div className="proveedor-contacto">
                      <span><Phone size={13} /> {proveedor.telefono}</span>
                      <span><Mail size={13} /> {proveedor.email || "Sin email"}</span>
                    </div>
                  </td>

                  <td>{proveedor.compras}</td>

                  <td>
                    <strong className="proveedor-total">
                      {formatoPrecio(proveedor.totalCompras)}
                    </strong>
                  </td>

                  <td>
                    <span className={`proveedor-estado ${proveedor.estado.toLowerCase()}`}>
                      {proveedor.estado}
                    </span>
                  </td>

                  <td>
                    <div className="proveedor-acciones">
                      <button
                        title="Ver información"
                        onClick={() => setProveedorSeleccionado(proveedor)}
                      >
                        <Eye size={17} />
                      </button>
                      <button
                        title="Editar proveedor"
                        onClick={() => abrirEdicion(proveedor)}
                      >
                        <Pencil size={17} />
                      </button>
                      <button
                        className="proveedor-eliminar"
                        title="Eliminar proveedor"
                        onClick={() => eliminarProveedor(proveedor.id)}
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {proveedoresFiltrados.length === 0 && (
            <div className="proveedores-vacio">
              <Truck size={32} />
              <strong>No se encontraron proveedores</strong>
              <span>Probá con otra búsqueda.</span>
            </div>
          )}
        </div>
      </section>

      {modalAbierto && (
        <div className="proveedor-modal-fondo">
          <form className="proveedor-modal" onSubmit={guardarProveedor}>
            <button
              type="button"
              className="proveedor-modal-cerrar"
              onClick={() => setModalAbierto(false)}
              aria-label="Cerrar"
            >
              <X size={20} />
            </button>

            <div className="proveedor-modal-icono"><Truck size={25} /></div>

            <h2>
              {proveedorEditando !== null ? "Editar proveedor" : "Nuevo proveedor"}
            </h2>
            <p>Completá la información comercial del proveedor.</p>

            <div className="proveedor-form-grid">
              <label className="proveedor-campo-completo">
                Razón social *
                <input
                  required
                  value={formulario.razonSocial}
                  onChange={(e) =>
                    setFormulario({ ...formulario, razonSocial: e.target.value })
                  }
                  placeholder="Nombre o razón social"
                />
              </label>

              <label>
                CUIT
                <input
                  value={formulario.cuit}
                  onChange={(e) =>
                    setFormulario({ ...formulario, cuit: e.target.value })
                  }
                  placeholder="30-12345678-9"
                />
              </label>

              <label>
                Teléfono *
                <input
                  required
                  value={formulario.telefono}
                  onChange={(e) =>
                    setFormulario({ ...formulario, telefono: e.target.value })
                  }
                  placeholder="381..."
                />
              </label>

              <label>
                Email
                <input
                  type="email"
                  value={formulario.email}
                  onChange={(e) =>
                    setFormulario({ ...formulario, email: e.target.value })
                  }
                  placeholder="proveedor@email.com"
                />
              </label>

              <label>
                Estado
                <select
                  value={formulario.estado}
                  onChange={(e) =>
                    setFormulario({
                      ...formulario,
                      estado: e.target.value as "Activo" | "Inactivo",
                    })
                  }
                >
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                </select>
              </label>

              <label className="proveedor-campo-completo">
                Dirección
                <input
                  value={formulario.direccion}
                  onChange={(e) =>
                    setFormulario({ ...formulario, direccion: e.target.value })
                  }
                  placeholder="Localidad y dirección"
                />
              </label>
            </div>

            <div className="proveedor-modal-acciones">
              <button
                type="button"
                className="proveedor-cancelar-btn"
                onClick={() => setModalAbierto(false)}
              >
                Cancelar
              </button>
              <button type="submit" className="proveedor-guardar-btn">
                {proveedorEditando !== null ? "Guardar cambios" : "Registrar proveedor"}
              </button>
            </div>
          </form>
        </div>
      )}

      {proveedorSeleccionado && (
        <div className="proveedor-modal-fondo">
          <div className="proveedor-modal proveedor-detalle-modal">
            <button
              className="proveedor-modal-cerrar"
              onClick={() => setProveedorSeleccionado(null)}
              aria-label="Cerrar"
            >
              <X size={20} />
            </button>

            <div className="proveedor-modal-icono"><Building2 size={25} /></div>
            <h2>{proveedorSeleccionado.razonSocial}</h2>
            <p>Información general del proveedor.</p>

            <div className="proveedor-detalle-lista">
              <span><Building2 size={16} /> CUIT: {proveedorSeleccionado.cuit || "Sin CUIT"}</span>
              <span><Phone size={16} /> {proveedorSeleccionado.telefono}</span>
              <span><Mail size={16} /> {proveedorSeleccionado.email || "Sin email"}</span>
              <span><MapPin size={16} /> {proveedorSeleccionado.direccion || "Sin dirección"}</span>
              <span><ShoppingBag size={16} /> Compras registradas: {proveedorSeleccionado.compras}</span>
              <strong>Total comprado: {formatoPrecio(proveedorSeleccionado.totalCompras)}</strong>
              <span>Estado: {proveedorSeleccionado.estado}</span>
            </div>

            <button
              className="proveedor-guardar-btn proveedor-detalle-cerrar"
              onClick={() => setProveedorSeleccionado(null)}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
