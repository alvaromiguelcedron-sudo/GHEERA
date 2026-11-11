
import { useMemo, useState } from "react";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowDownCircle,
  ArrowUpCircle,
  Plus,
  Search,
  CalendarDays,
  X,
  CheckCircle2,
  Clock,
  Lock,
  Unlock,
} from "lucide-react";
import "./Caja.css";

type TipoMovimiento = "ingreso" | "egreso";

interface MovimientoCaja {
  id: number;
  descripcion: string;
  tipo: TipoMovimiento;
  categoria: string;
  monto: number;
  fecha: string;
  hora: string;
}

const movimientosIniciales: MovimientoCaja[] = [
  {
    id: 1,
    descripcion: "Venta de productos",
    tipo: "ingreso",
    categoria: "Venta",
    monto: 45000,
    fecha: "2026-11-10",
    hora: "09:30",
  },
  {
    id: 2,
    descripcion: "Compra de insumos",
    tipo: "egreso",
    categoria: "Gasto",
    monto: 12000,
    fecha: "2026-11-10",
    hora: "10:15",
  },
  {
    id: 3,
    descripcion: "Venta de indumentaria",
    tipo: "ingreso",
    categoria: "Venta",
    monto: 32000,
    fecha: "2026-11-10",
    hora: "11:40",
  },
  {
    id: 4,
    descripcion: "Pago de transporte",
    tipo: "egreso",
    categoria: "Transporte",
    monto: 5000,
    fecha: "2026-11-10",
    hora: "12:20",
  },
];

export default function Caja() {
  const [movimientos, setMovimientos] = useState<MovimientoCaja[]>(
    movimientosIniciales
  );
  const [cajaAbierta, setCajaAbierta] = useState(true);
  const [saldoInicial, setSaldoInicial] = useState(50000);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [tipoNuevo, setTipoNuevo] = useState<TipoMovimiento>("ingreso");
  const [busqueda, setBusqueda] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("todos");

  const [descripcion, setDescripcion] = useState("");
  const [categoria, setCategoria] = useState("Otro");
  const [monto, setMonto] = useState("");

  const formatoPrecio = (valor: number) =>
    valor.toLocaleString("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    });

  const totalIngresos = useMemo(
    () =>
      movimientos
        .filter((movimiento) => movimiento.tipo === "ingreso")
        .reduce((total, movimiento) => total + movimiento.monto, 0),
    [movimientos]
  );

  const totalEgresos = useMemo(
    () =>
      movimientos
        .filter((movimiento) => movimiento.tipo === "egreso")
        .reduce((total, movimiento) => total + movimiento.monto, 0),
    [movimientos]
  );

  const saldoActual = saldoInicial + totalIngresos - totalEgresos;

  const movimientosFiltrados = movimientos.filter((movimiento) => {
    const coincideBusqueda =
      movimiento.descripcion.toLowerCase().includes(busqueda.toLowerCase()) ||
      movimiento.categoria.toLowerCase().includes(busqueda.toLowerCase());

    const coincideTipo =
      filtroTipo === "todos" || movimiento.tipo === filtroTipo;

    return coincideBusqueda && coincideTipo;
  });

  const abrirModal = (tipo: TipoMovimiento) => {
    setTipoNuevo(tipo);
    setDescripcion("");
    setCategoria(tipo === "ingreso" ? "Otro" : "Gasto");
    setMonto("");
    setMostrarModal(true);
  };

  const registrarMovimiento = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const montoNumerico = Number(monto);

    if (!descripcion.trim() || !monto || montoNumerico <= 0) return;

    const ahora = new Date();

    const nuevoMovimiento: MovimientoCaja = {
      id: Date.now(),
      descripcion: descripcion.trim(),
      tipo: tipoNuevo,
      categoria,
      monto: montoNumerico,
      fecha: ahora.toISOString().split("T")[0],
      hora: ahora.toLocaleTimeString("es-AR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMovimientos((actuales) => [nuevoMovimiento, ...actuales]);
    setMostrarModal(false);
  };

  const alternarCaja = () => {
    setCajaAbierta((actual) => !actual);
  };

  const fechaActual = new Date().toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="caja-page">
      <header className="caja-header">
        <div>
          <span className="caja-eyebrow">GESTIÓN FINANCIERA</span>
          <h1>Caja</h1>
          <p>Controlá los ingresos, egresos y movimientos de dinero.</p>
        </div>

        <div className="caja-header-fecha">
          <CalendarDays size={17} />
          <span>{fechaActual}</span>
        </div>
      </header>

      <section className="caja-estado">
        <div className="caja-estado-info">
          <div className={`caja-estado-icon ${cajaAbierta ? "abierta" : "cerrada"}`}>
            {cajaAbierta ? <Unlock size={23} /> : <Lock size={23} />}
          </div>
          <div>
            <span>Estado de caja</span>
            <strong>{cajaAbierta ? "Caja abierta" : "Caja cerrada"}</strong>
            <small>
              {cajaAbierta
                ? "Podés registrar movimientos."
                : "La caja está bloqueada para nuevos movimientos."}
            </small>
          </div>
        </div>

        <button
          type="button"
          className={`caja-estado-boton ${cajaAbierta ? "boton-cerrar" : "boton-abrir"}`}
          onClick={alternarCaja}
        >
          {cajaAbierta ? <Lock size={17} /> : <Unlock size={17} />}
          {cajaAbierta ? "Cerrar caja" : "Abrir caja"}
        </button>
      </section>

      <section className="caja-resumen">
        <article className="caja-stat-card">
          <div className="caja-stat-icon saldo">
            <Wallet size={22} />
          </div>
          <div>
            <span>Saldo actual</span>
            <strong>{formatoPrecio(saldoActual)}</strong>
            <small>Saldo inicial + ingresos - egresos</small>
          </div>
        </article>

        <article className="caja-stat-card">
          <div className="caja-stat-icon ingresos">
            <TrendingUp size={22} />
          </div>
          <div>
            <span>Total de ingresos</span>
            <strong>{formatoPrecio(totalIngresos)}</strong>
            <small>Movimientos registrados</small>
          </div>
        </article>

        <article className="caja-stat-card">
          <div className="caja-stat-icon egresos">
            <TrendingDown size={22} />
          </div>
          <div>
            <span>Total de egresos</span>
            <strong>{formatoPrecio(totalEgresos)}</strong>
            <small>Movimientos registrados</small>
          </div>
        </article>
      </section>

      <section className="caja-acciones">
        <button
          type="button"
          className="caja-accion ingreso"
          disabled={!cajaAbierta}
          onClick={() => abrirModal("ingreso")}
        >
          <ArrowDownCircle size={20} />
          Registrar ingreso
          <Plus size={17} />
        </button>

        <button
          type="button"
          className="caja-accion egreso"
          disabled={!cajaAbierta}
          onClick={() => abrirModal("egreso")}
        >
          <ArrowUpCircle size={20} />
          Registrar egreso
          <Plus size={17} />
        </button>
      </section>

      <section className="caja-panel">
        <div className="caja-panel-header">
          <div>
            <h2>Movimientos de caja</h2>
            <p>Historial de ingresos y egresos.</p>
          </div>
          <span className="caja-movimientos-total">
            {movimientos.length} movimientos
          </span>
        </div>

        <div className="caja-filtros">
          <div className="caja-busqueda">
            <Search size={18} />
            <input
              type="text"
              placeholder="Buscar movimiento..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            aria-label="Filtrar movimientos"
          >
            <option value="todos">Todos los movimientos</option>
            <option value="ingreso">Solo ingresos</option>
            <option value="egreso">Solo egresos</option>
          </select>
        </div>

        <div className="caja-tabla-contenedor">
          <table className="caja-tabla">
            <thead>
              <tr>
                <th>Movimiento</th>
                <th>Categoría</th>
                <th>Fecha y hora</th>
                <th>Tipo</th>
                <th className="alinear-derecha">Importe</th>
              </tr>
            </thead>

            <tbody>
              {movimientosFiltrados.length > 0 ? (
                movimientosFiltrados.map((movimiento) => (
                  <tr key={movimiento.id}>
                    <td>
                      <div className="caja-movimiento-nombre">
                        <div
                          className={`caja-movimiento-icon ${movimiento.tipo}`}
                        >
                          {movimiento.tipo === "ingreso" ? (
                            <ArrowDownCircle size={17} />
                          ) : (
                            <ArrowUpCircle size={17} />
                          )}
                        </div>
                        <strong>{movimiento.descripcion}</strong>
                      </div>
                    </td>
                    <td>{movimiento.categoria}</td>
                    <td>
                      <div className="caja-fecha-hora">
                        <span>{movimiento.fecha}</span>
                        <small>{movimiento.hora}</small>
                      </div>
                    </td>
                    <td>
                      <span className={`caja-tipo ${movimiento.tipo}`}>
                        {movimiento.tipo === "ingreso" ? "Ingreso" : "Egreso"}
                      </span>
                    </td>
                    <td
                      className={`alinear-derecha caja-importe ${movimiento.tipo}`}
                    >
                      {movimiento.tipo === "ingreso" ? "+" : "-"}
                      {formatoPrecio(movimiento.monto)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="caja-sin-resultados">
                    No se encontraron movimientos.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="caja-nota">
        <Clock size={17} />
        <p>
          Los movimientos de esta pantalla son de ejemplo. En la integración
          conectaremos la caja con las ventas, compras y movimientos reales.
        </p>
      </section>

      {mostrarModal && (
        <div
          className="caja-modal-overlay"
          onClick={() => setMostrarModal(false)}
        >
          <div className="caja-modal" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="caja-modal-cerrar"
              onClick={() => setMostrarModal(false)}
              aria-label="Cerrar"
            >
              <X size={20} />
            </button>

            <div className={`caja-modal-icon ${tipoNuevo}`}>
              {tipoNuevo === "ingreso" ? (
                <ArrowDownCircle size={28} />
              ) : (
                <ArrowUpCircle size={28} />
              )}
            </div>

            <h2>
              Registrar {tipoNuevo === "ingreso" ? "ingreso" : "egreso"}
            </h2>
            <p>Completá los datos del movimiento.</p>

            <form onSubmit={registrarMovimiento}>
              <label>
                Descripción
                <input
                  type="text"
                  placeholder="Ej. Pago de servicios"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  required
                />
              </label>

              <label>
                Categoría
                <select
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                >
                  {tipoNuevo === "ingreso" ? (
                    <>
                      <option value="Otro">Otro ingreso</option>
                      <option value="Venta">Venta</option>
                      <option value="Aporte">Aporte de dinero</option>
                    </>
                  ) : (
                    <>
                      <option value="Gasto">Gasto general</option>
                      <option value="Transporte">Transporte</option>
                      <option value="Servicios">Servicios</option>
                      <option value="Proveedores">Proveedores</option>
                      <option value="Otro">Otro egreso</option>
                    </>
                  )}
                </select>
              </label>

              <label>
                Importe
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  placeholder="Ingresá el importe"
                  value={monto}
                  onChange={(e) => setMonto(e.target.value)}
                  required
                />
              </label>

              <button type="submit" className="caja-modal-guardar">
                <CheckCircle2 size={18} />
                Registrar movimiento
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
