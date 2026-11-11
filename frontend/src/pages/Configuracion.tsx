
import { useState, type FormEvent } from "react";
import {
  Settings,
  Store,
  Users,
  ShieldCheck,
  Percent,
  SlidersHorizontal,
  Save,
  Plus,
  Pencil,
  Trash2,
  UserRound,
  X,
  CheckCircle2,
} from "lucide-react";
import "./Configuracion.css";

type Seccion =
  | "negocio"
  | "usuarios"
  | "permisos"
  | "intereses"
  | "preferencias";

interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: "Administrador" | "Vendedor";
  estado: "Activo" | "Inactivo";
}

const usuariosIniciales: Usuario[] = [
  {
    id: 1,
    nombre: "Administrador principal",
    email: "admin@gheera.com",
    rol: "Administrador",
    estado: "Activo",
  },
  {
    id: 2,
    nombre: "Vendedor principal",
    email: "vendedor@gheera.com",
    rol: "Vendedor",
    estado: "Activo",
  },
];

const secciones: {
  id: Seccion;
  nombre: string;
  descripcion: string;
  icono: typeof Store;
}[] = [
  {
    id: "negocio",
    nombre: "Datos del negocio",
    descripcion: "Información comercial",
    icono: Store,
  },
  {
    id: "usuarios",
    nombre: "Usuarios",
    descripcion: "Administrar cuentas",
    icono: Users,
  },
  {
    id: "permisos",
    nombre: "Roles y permisos",
    descripcion: "Control de accesos",
    icono: ShieldCheck,
  },
  {
    id: "intereses",
    nombre: "Intereses y cuotas",
    descripcion: "Vencimientos y recargos",
    icono: Percent,
  },
  {
    id: "preferencias",
    nombre: "Preferencias",
    descripcion: "Opciones generales",
    icono: SlidersHorizontal,
  },
];

export default function Configuracion() {
  const [seccionActiva, setSeccionActiva] = useState<Seccion>("negocio");
  const [usuarios, setUsuarios] = useState<Usuario[]>(usuariosIniciales);
  const [usuarioModal, setUsuarioModal] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState<number | null>(null);

  const [nombreNegocio, setNombreNegocio] = useState("GHEERA");
  const [telefono, setTelefono] = useState("");
  const [correo, setCorreo] = useState("");
  const [direccion, setDireccion] = useState("");

  const [tasaInteres, setTasaInteres] = useState("0.05");
  const [periodicidad, setPeriodicidad] = useState("mensual");
  const [diasGracia, setDiasGracia] = useState("0");

  const [notificaciones, setNotificaciones] = useState(true);
  const [alertasStock, setAlertasStock] = useState(true);
  const [confirmarVentas, setConfirmarVentas] = useState(true);

  const [nombreUsuario, setNombreUsuario] = useState("");
  const [emailUsuario, setEmailUsuario] = useState("");
  const [rolUsuario, setRolUsuario] = useState<"Administrador" | "Vendedor">(
    "Vendedor"
  );

  const [mensajeGuardado, setMensajeGuardado] = useState(false);

  const mostrarGuardado = () => {
    setMensajeGuardado(true);
    window.setTimeout(() => setMensajeGuardado(false), 3000);
  };

  const guardarNegocio = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    mostrarGuardado();
  };

  const guardarIntereses = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    mostrarGuardado();
  };

  const guardarPreferencias = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    mostrarGuardado();
  };

  const abrirNuevoUsuario = () => {
    setUsuarioEditando(null);
    setNombreUsuario("");
    setEmailUsuario("");
    setRolUsuario("Vendedor");
    setUsuarioModal(true);
  };

  const editarUsuario = (usuario: Usuario) => {
    setUsuarioEditando(usuario.id);
    setNombreUsuario(usuario.nombre);
    setEmailUsuario(usuario.email);
    setRolUsuario(usuario.rol);
    setUsuarioModal(true);
  };

  const guardarUsuario = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!nombreUsuario.trim() || !emailUsuario.trim()) return;

    if (usuarioEditando !== null) {
      setUsuarios((actuales) =>
        actuales.map((usuario) =>
          usuario.id === usuarioEditando
            ? {
                ...usuario,
                nombre: nombreUsuario.trim(),
                email: emailUsuario.trim(),
                rol: rolUsuario,
              }
            : usuario
        )
      );
    } else {
      const nuevoUsuario: Usuario = {
        id: Date.now(),
        nombre: nombreUsuario.trim(),
        email: emailUsuario.trim(),
        rol: rolUsuario,
        estado: "Activo",
      };

      setUsuarios((actuales) => [...actuales, nuevoUsuario]);
    }

    setUsuarioModal(false);
    mostrarGuardado();
  };

  const eliminarUsuario = (id: number) => {
    const confirmar = window.confirm(
      "¿Estás seguro de que querés eliminar este usuario de la lista de ejemplo?"
    );

    if (confirmar) {
      setUsuarios((actuales) =>
        actuales.filter((usuario) => usuario.id !== id)
      );
    }
  };

  const cambiarEstadoUsuario = (id: number) => {
    setUsuarios((actuales) =>
      actuales.map((usuario) =>
        usuario.id === id
          ? {
              ...usuario,
              estado: usuario.estado === "Activo" ? "Inactivo" : "Activo",
            }
          : usuario
      )
    );
  };

  const renderContenido = () => {
    switch (seccionActiva) {
      case "negocio":
        return (
          <section className="config-contenido">
            <div className="config-titulo-seccion">
              <h2>Datos del negocio</h2>
              <p>Configurá la información principal de tu comercio.</p>
            </div>

            <form className="config-formulario" onSubmit={guardarNegocio}>
              <label>
                Nombre comercial
                <input
                  type="text"
                  value={nombreNegocio}
                  onChange={(e) => setNombreNegocio(e.target.value)}
                  placeholder="Nombre del negocio"
                  required
                />
              </label>

              <label>
                Teléfono
                <input
                  type="tel"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="Ej. 381 555 5555"
                />
              </label>

              <label>
                Correo electrónico
                <input
                  type="email"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  placeholder="negocio@correo.com"
                />
              </label>

              <label>
                Dirección
                <input
                  type="text"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  placeholder="Dirección del comercio"
                />
              </label>

              <div className="config-info">
                <Store size={18} />
                <span>
                  Esta información podrá utilizarse más adelante en comprobantes
                  y reportes.
                </span>
              </div>

              <button type="submit" className="config-guardar">
                <Save size={17} />
                Guardar información
              </button>
            </form>
          </section>
        );

      case "usuarios":
        return (
          <section className="config-contenido">
            <div className="config-titulo-seccion config-usuarios-titulo">
              <div>
                <h2>Administración de usuarios</h2>
                <p>Creá y administrá las cuentas que utilizan GHEERA.</p>
              </div>

              <button
                type="button"
                className="config-agregar"
                onClick={abrirNuevoUsuario}
              >
                <Plus size={17} />
                Agregar usuario
              </button>
            </div>

            <div className="config-usuarios-lista">
              {usuarios.map((usuario) => (
                <article className="config-usuario" key={usuario.id}>
                  <div className="config-usuario-icon">
                    <UserRound size={21} />
                  </div>

                  <div className="config-usuario-info">
                    <strong>{usuario.nombre}</strong>
                    <span>{usuario.email}</span>
                    <div className="config-usuario-etiquetas">
                      <span
                        className={`config-rol ${usuario.rol === "Administrador" ? "admin" : "vendedor"}`}
                      >
                        {usuario.rol}
                      </span>
                      <span
                        className={`config-estado ${usuario.estado.toLowerCase()}`}
                      >
                        {usuario.estado}
                      </span>
                    </div>
                  </div>

                  <div className="config-usuario-acciones">
                    <button
                      type="button"
                      title="Cambiar estado"
                      onClick={() => cambiarEstadoUsuario(usuario.id)}
                    >
                      {usuario.estado === "Activo" ? "Desactivar" : "Activar"}
                    </button>
                    <button
                      type="button"
                      title="Editar usuario"
                      onClick={() => editarUsuario(usuario)}
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      type="button"
                      className="config-eliminar"
                      title="Eliminar usuario"
                      onClick={() => eliminarUsuario(usuario.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </article>
              ))}
            </div>

            <div className="config-info">
              <ShieldCheck size={18} />
              <span>
                La creación de cuentas y el control real de acceso se activarán
                al conectar el sistema de autenticación.
              </span>
            </div>
          </section>
        );

      case "permisos":
        return (
          <section className="config-contenido">
            <div className="config-titulo-seccion">
              <h2>Roles y permisos</h2>
              <p>Definición de los accesos para cada tipo de usuario.</p>
            </div>

            <div className="config-rol-card">
              <div className="config-rol-card-titulo">
                <div className="config-rol-icon admin">
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <h3>Administrador</h3>
                  <span>Acceso completo al sistema</span>
                </div>
              </div>

              <ul>
                <li>Gestionar productos y stock.</li>
                <li>Registrar y consultar todas las ventas.</li>
                <li>Administrar clientes y cuentas corrientes.</li>
                <li>Gestionar cuotas, proveedores y compras.</li>
                <li>Controlar caja, ingresos y egresos.</li>
                <li>Consultar reportes y estadísticas.</li>
                <li>Administrar usuarios y configuraciones.</li>
              </ul>
            </div>

            <div className="config-rol-card">
              <div className="config-rol-card-titulo">
                <div className="config-rol-icon vendedor">
                  <UserRound size={22} />
                </div>
                <div>
                  <h3>Vendedor</h3>
                  <span>Acceso limitado a las operaciones de venta</span>
                </div>
              </div>

              <ul>
                <li>Consultar productos disponibles.</li>
                <li>Registrar ventas en efectivo o transferencia.</li>
                <li>Registrar ventas a cuenta corriente según autorización.</li>
                <li>Consultar clientes necesarios para vender.</li>
                <li>No puede modificar productos ni stock.</li>
                <li>No puede consultar saldos ni totales de caja.</li>
                <li>No puede administrar usuarios ni configuraciones.</li>
              </ul>
            </div>

            <div className="config-info">
              <ShieldCheck size={18} />
              <span>
                Estos permisos son una definición visual. La seguridad real
                deberá validarse también desde el backend.
              </span>
            </div>
          </section>
        );

      case "intereses":
        return (
          <section className="config-contenido">
            <div className="config-titulo-seccion">
              <h2>Intereses y cuotas</h2>
              <p>Configurá las reglas de financiación y vencimientos.</p>
            </div>

            <form className="config-formulario" onSubmit={guardarIntereses}>
              <div className="config-campo-destacado">
                <label>
                  Tasa de recargo diario (%)
                  <div className="config-input-sufijo">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={tasaInteres}
                      onChange={(e) => setTasaInteres(e.target.value)}
                    />
                    <span>% diario</span>
                  </div>
                </label>

                <small>
                  Valor inicial configurado: 0,05% diario, según la regla
                  definida para GHEERA.
                </small>
              </div>

              <label>
                Periodicidad predeterminada
                <select
                  value={periodicidad}
                  onChange={(e) => setPeriodicidad(e.target.value)}
                >
                  <option value="semanal">Semanal</option>
                  <option value="quincenal">Quincenal</option>
                  <option value="mensual">Mensual</option>
                </select>
              </label>

              <label>
                Días de gracia
                <input
                  type="number"
                  min="0"
                  value={diasGracia}
                  onChange={(e) => setDiasGracia(e.target.value)}
                />
              </label>

              <div className="config-info">
                <Percent size={18} />
                <span>
                  El cálculo definitivo del recargo se realizará desde la fecha
                  de vencimiento asignada por el administrador.
                </span>
              </div>

              <button type="submit" className="config-guardar">
                <Save size={17} />
                Guardar reglas financieras
              </button>
            </form>
          </section>
        );

      case "preferencias":
        return (
          <section className="config-contenido">
            <div className="config-titulo-seccion">
              <h2>Preferencias generales</h2>
              <p>Personalizá algunas opciones de funcionamiento.</p>
            </div>

            <form className="config-preferencias" onSubmit={guardarPreferencias}>
              <label className="config-preferencia">
                <div>
                  <strong>Notificaciones</strong>
                  <span>Permitir avisos y notificaciones del sistema.</span>
                </div>
                <input
                  type="checkbox"
                  checked={notificaciones}
                  onChange={(e) => setNotificaciones(e.target.checked)}
                />
              </label>

              <label className="config-preferencia">
                <div>
                  <strong>Alertas de stock bajo</strong>
                  <span>Avisar cuando un producto necesite reposición.</span>
                </div>
                <input
                  type="checkbox"
                  checked={alertasStock}
                  onChange={(e) => setAlertasStock(e.target.checked)}
                />
              </label>

              <label className="config-preferencia">
                <div>
                  <strong>Confirmación de ventas</strong>
                  <span>Solicitar confirmación antes de registrar una venta.</span>
                </div>
                <input
                  type="checkbox"
                  checked={confirmarVentas}
                  onChange={(e) => setConfirmarVentas(e.target.checked)}
                />
              </label>

              <button type="submit" className="config-guardar">
                <Save size={17} />
                Guardar preferencias
              </button>
            </form>
          </section>
        );
    }
  };

  return (
    <div className="config-page">
      <header className="config-header">
        <div>
          <span className="config-eyebrow">PERSONALIZACIÓN DEL SISTEMA</span>
          <h1>Configuración</h1>
          <p>Administrá los datos, usuarios y reglas de GHEERA.</p>
        </div>

        <div className="config-header-icon">
          <Settings size={25} />
        </div>
      </header>

      {mensajeGuardado && (
        <div className="config-mensaje">
          <CheckCircle2 size={18} />
          Cambios actualizados en esta vista de demostración.
        </div>
      )}

      <div className="config-layout">
        <aside className="config-menu">
          <span className="config-menu-titulo">AJUSTES</span>

          {secciones.map((seccion) => {
            const Icono = seccion.icono;

            return (
              <button
                type="button"
                key={seccion.id}
                className={`config-menu-item ${seccionActiva === seccion.id ? "activo" : ""}`}
                onClick={() => setSeccionActiva(seccion.id)}
              >
                <Icono size={19} />
                <span>
                  <strong>{seccion.nombre}</strong>
                  <small>{seccion.descripcion}</small>
                </span>
              </button>
            );
          })}
        </aside>

        <div className="config-panel">
          {renderContenido()}
        </div>
      </div>

      {usuarioModal && (
        <div
          className="config-modal-overlay"
          onClick={() => setUsuarioModal(false)}
        >
          <div
            className="config-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="config-modal-cerrar"
              onClick={() => setUsuarioModal(false)}
              aria-label="Cerrar"
            >
              <X size={20} />
            </button>

            <div className="config-modal-icon">
              <UserRound size={26} />
            </div>

            <h2>
              {usuarioEditando !== null ? "Editar usuario" : "Nuevo usuario"}
            </h2>
            <p>Completá los datos de la cuenta.</p>

            <form onSubmit={guardarUsuario}>
              <label>
                Nombre completo
                <input
                  type="text"
                  value={nombreUsuario}
                  onChange={(e) => setNombreUsuario(e.target.value)}
                  placeholder="Nombre y apellido"
                  required
                />
              </label>

              <label>
                Correo electrónico
                <input
                  type="email"
                  value={emailUsuario}
                  onChange={(e) => setEmailUsuario(e.target.value)}
                  placeholder="usuario@correo.com"
                  required
                />
              </label>

              <label>
                Rol del usuario
                <select
                  value={rolUsuario}
                  onChange={(e) =>
                    setRolUsuario(e.target.value as "Administrador" | "Vendedor")
                  }
                >
                  <option value="Administrador">Administrador</option>
                  <option value="Vendedor">Vendedor</option>
                </select>
              </label>

              <button type="submit" className="config-guardar">
                <Save size={17} />
                Guardar usuario
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
