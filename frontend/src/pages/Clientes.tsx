
import { useMemo, useState } from "react";
import {
  Users,
  Search,
  Plus,
  UserRound,
  Phone,
  MapPin,
  Mail,
  Pencil,
  Trash2,
  X,
  Wallet,
  ShoppingBag,
  Eye,
} from "lucide-react";

import "./Clientes.css";

interface Cliente {
  id: number;
  nombre: string;
  apellido: string;
  telefono: string;
  email: string;
  direccion: string;
  cuentaCorriente: boolean;
  deuda: number;
  compras: number;
}

const clientesIniciales: Cliente[] = [
  {
    id: 1,
    nombre: "Martín",
    apellido: "Gómez",
    telefono: "381 555-1234",
    email: "martin@email.com",
    direccion: "San Miguel de Tucumán",
    cuentaCorriente: true,
    deuda: 45000,
    compras: 12,
  },
  {
    id: 2,
    nombre: "Lucía",
    apellido: "Fernández",
    telefono: "381 555-2345",
    email: "lucia@email.com",
    direccion: "Yerba Buena",
    cuentaCorriente: true,
    deuda: 0,
    compras: 8,
  },
  {
    id: 3,
    nombre: "Juan",
    apellido: "Pérez",
    telefono: "381 555-3456",
    email: "juan@email.com",
    direccion: "Aguilares",
    cuentaCorriente: false,
    deuda: 0,
    compras: 3,
  },
];

const formatoPrecio = (valor: number) =>
  valor.toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  });

const formularioVacio = {
  nombre: "",
  apellido: "",
  telefono: "",
  email: "",
  direccion: "",
  cuentaCorriente: false,
};

export default function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>(clientesIniciales);
  const [busqueda, setBusqueda] = useState("");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [clienteEditando, setClienteEditando] = useState<number | null>(null);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
  const [formulario, setFormulario] = useState(formularioVacio);

  const clientesFiltrados = useMemo(
    () =>
      clientes.filter((cliente) =>
        `${cliente.nombre} ${cliente.apellido} ${cliente.telefono}`
          .toLowerCase()
          .includes(busqueda.toLowerCase())
      ),
    [clientes, busqueda]
  );

  const totalDeuda = clientes.reduce(
    (total, cliente) => total + cliente.deuda,
    0
  );

  const clientesConCuenta = clientes.filter(
    (cliente) => cliente.cuentaCorriente
  ).length;

  const abrirNuevoCliente = () => {
    setFormulario(formularioVacio);
    setClienteEditando(null);
    setModalAbierto(true);
  };

  const abrirEdicion = (cliente: Cliente) => {
    setFormulario({
      nombre: cliente.nombre,
      apellido: cliente.apellido,
      telefono: cliente.telefono,
      email: cliente.email,
      direccion: cliente.direccion,
      cuentaCorriente: cliente.cuentaCorriente,
    });
    setClienteEditando(cliente.id);
    setModalAbierto(true);
  };

  const guardarCliente = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (clienteEditando !== null) {
      setClientes((actuales) =>
        actuales.map((cliente) =>
          cliente.id === clienteEditando
            ? { ...cliente, ...formulario }
            : cliente
        )
      );
    } else {
      const nuevoCliente: Cliente = {
        id: Date.now(),
        ...formulario,
        deuda: 0,
        compras: 0,
      };

      setClientes((actuales) => [...actuales, nuevoCliente]);
    }

    setModalAbierto(false);
    setFormulario(formularioVacio);
    setClienteEditando(null);
  };

  const eliminarCliente = (id: number) => {
    const confirmar = window.confirm(
      "¿Estás seguro de que querés eliminar este cliente de la vista?"
    );

    if (confirmar) {
      setClientes((actuales) =>
        actuales.filter((cliente) => cliente.id !== id)
      );
    }
  };

  return (
    <div className="clientes-page">
      <header className="clientes-header">
        <div>
          <span className="clientes-eyebrow">GESTIÓN COMERCIAL</span>
          <h1>Clientes</h1>
          <p>Administrá tus clientes y sus cuentas comerciales.</p>
        </div>

        <button className="cliente-nuevo-btn" onClick={abrirNuevoCliente}>
          <Plus size={19} />
          Nuevo cliente
        </button>
      </header>

      <section className="clientes-resumen">
        <article className="cliente-resumen-card">
          <div className="cliente-resumen-icon"><Users /></div>
          <div>
            <span>Total de clientes</span>
            <strong>{clientes.length}</strong>
            <small>Clientes registrados en pantalla</small>
          </div>
        </article>

        <article className="cliente-resumen-card">
          <div className="cliente-resumen-icon"><Wallet /></div>
          <div>
            <span>Con cuenta corriente</span>
            <strong>{clientesConCuenta}</strong>
            <small>Clientes habilitados para crédito</small>
          </div>
        </article>

        <article className="cliente-resumen-card">
          <div className="cliente-resumen-icon"><ShoppingBag /></div>
          <div>
            <span>Deuda total registrada</span>
            <strong>{formatoPrecio(totalDeuda)}</strong>
            <small>Importes de ejemplo</small>
          </div>
        </article>
      </section>

      <section className="clientes-panel">
        <div className="clientes-panel-header">
          <div>
            <h2>Listado de clientes</h2>
            <p>Buscá y administrá la información de tus clientes.</p>
          </div>
          <span className="clientes-etiqueta">DIRECTORIO</span>
        </div>

        <div className="clientes-buscador">
          <Search size={19} />
          <input
            type="text"
            placeholder="Buscar por nombre, apellido o teléfono..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        <div className="clientes-tabla-contenedor">
          <table className="clientes-tabla">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Contacto</th>
                <th>Cuenta corriente</th>
                <th>Deuda pendiente</th>
                <th>Compras</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {clientesFiltrados.map((cliente) => (
                <tr key={cliente.id}>
                  <td>
                    <div className="cliente-identidad">
                      <div className="cliente-avatar">
                        {cliente.nombre.charAt(0)}
                        {cliente.apellido.charAt(0)}
                      </div>
                      <div>
                        <strong>{cliente.nombre} {cliente.apellido}</strong>
                        <small>{cliente.direccion || "Sin dirección"}</small>
                      </div>
                    </div>
                  </td>

                  <td>
                    <div className="cliente-contacto">
                      <span><Phone size={13} /> {cliente.telefono}</span>
                      <span><Mail size={13} /> {cliente.email || "Sin email"}</span>
                    </div>
                  </td>

                  <td>
                    <span className={`cliente-estado ${cliente.cuentaCorriente ? "habilitada" : "deshabilitada"}`}>
                      {cliente.cuentaCorriente ? "Habilitada" : "No habilitada"}
                    </span>
                  </td>

                  <td>
                    <strong className={cliente.deuda > 0 ? "cliente-deuda" : "cliente-sin-deuda"}>
                      {formatoPrecio(cliente.deuda)}
                    </strong>
                  </td>

                  <td>{cliente.compras}</td>

                  <td>
                    <div className="cliente-acciones">
                      <button
                        title="Ver información"
                        onClick={() => setClienteSeleccionado(cliente)}
                      >
                        <Eye size={17} />
                      </button>
                      <button
                        title="Editar cliente"
                        onClick={() => abrirEdicion(cliente)}
                      >
                        <Pencil size={17} />
                      </button>
                      <button
                        className="cliente-eliminar"
                        title="Eliminar cliente"
                        onClick={() => eliminarCliente(cliente.id)}
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {clientesFiltrados.length === 0 && (
            <div className="clientes-vacio">
              <Users size={32} />
              <strong>No se encontraron clientes</strong>
              <span>Probá con otro nombre o teléfono.</span>
            </div>
          )}
        </div>
      </section>

      {modalAbierto && (
        <div className="cliente-modal-fondo">
          <form className="cliente-modal" onSubmit={guardarCliente}>
            <button
              type="button"
              className="cliente-modal-cerrar"
              onClick={() => setModalAbierto(false)}
              aria-label="Cerrar"
            >
              <X size={20} />
            </button>

            <div className="cliente-modal-icono"><UserRound size={25} /></div>
            <h2>{clienteEditando !== null ? "Editar cliente" : "Nuevo cliente"}</h2>
            <p>Completá los datos para registrar al cliente.</p>

            <div className="cliente-form-grid">
              <label>
                Nombre *
                <input
                  required
                  value={formulario.nombre}
                  onChange={(e) => setFormulario({ ...formulario, nombre: e.target.value })}
                  placeholder="Nombre"
                />
              </label>

              <label>
                Apellido *
                <input
                  required
                  value={formulario.apellido}
                  onChange={(e) => setFormulario({ ...formulario, apellido: e.target.value })}
                  placeholder="Apellido"
                />
              </label>

              <label>
                Teléfono *
                <input
                  required
                  value={formulario.telefono}
                  onChange={(e) => setFormulario({ ...formulario, telefono: e.target.value })}
                  placeholder="381..."
                />
              </label>

              <label>
                Email
                <input
                  type="email"
                  value={formulario.email}
                  onChange={(e) => setFormulario({ ...formulario, email: e.target.value })}
                  placeholder="correo@email.com"
                />
              </label>

              <label className="cliente-campo-completo">
                Dirección
                <input
                  value={formulario.direccion}
                  onChange={(e) => setFormulario({ ...formulario, direccion: e.target.value })}
                  placeholder="Localidad y dirección"
                />
              </label>
            </div>

            <label className="cliente-checkbox">
              <input
                type="checkbox"
                checked={formulario.cuentaCorriente}
                onChange={(e) =>
                  setFormulario({ ...formulario, cuentaCorriente: e.target.checked })
                }
              />
              <span>Habilitar cuenta corriente</span>
            </label>

            <div className="cliente-modal-acciones">
              <button
                type="button"
                className="cliente-cancelar-btn"
                onClick={() => setModalAbierto(false)}
              >
                Cancelar
              </button>
              <button type="submit" className="cliente-guardar-btn">
                {clienteEditando !== null ? "Guardar cambios" : "Registrar cliente"}
              </button>
            </div>
          </form>
        </div>
      )}

      {clienteSeleccionado && (
        <div className="cliente-modal-fondo">
          <div className="cliente-modal cliente-detalle-modal">
            <button
              className="cliente-modal-cerrar"
              onClick={() => setClienteSeleccionado(null)}
              aria-label="Cerrar"
            >
              <X size={20} />
            </button>

            <div className="cliente-modal-icono"><UserRound size={25} /></div>
            <h2>{clienteSeleccionado.nombre} {clienteSeleccionado.apellido}</h2>
            <p>Información general del cliente.</p>

            <div className="cliente-detalle-lista">
              <span><Phone size={16} /> {clienteSeleccionado.telefono}</span>
              <span><Mail size={16} /> {clienteSeleccionado.email || "Sin email"}</span>
              <span><MapPin size={16} /> {clienteSeleccionado.direccion || "Sin dirección"}</span>
              <span><Wallet size={16} /> Cuenta corriente: {clienteSeleccionado.cuentaCorriente ? "Habilitada" : "No habilitada"}</span>
              <span><ShoppingBag size={16} /> Compras realizadas: {clienteSeleccionado.compras}</span>
              <strong>Deuda pendiente: {formatoPrecio(clienteSeleccionado.deuda)}</strong>
            </div>

            <button
              className="cliente-guardar-btn"
              onClick={() => setClienteSeleccionado(null)}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
