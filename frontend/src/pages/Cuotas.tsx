
import { useMemo, useState } from "react";
import {
  CalendarDays,
  Search,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Wallet,
  Eye,
  X,
  UserRound,
  Receipt,
} from "lucide-react";

import "./Cuotas.css";

interface Cuota {
  id: number;
  cliente: string;
  telefono: string;
  numero: number;
  totalCuotas: number;
  importe: number;
  pagado: number;
  vencimiento: string;
  periodicidad: "Semanal" | "Quincenal" | "Mensual";
}

const cuotasIniciales: Cuota[] = [
  {
    id: 1,
    cliente: "Martín Gómez",
    telefono: "381 555-1234",
    numero: 1,
    totalCuotas: 3,
    importe: 30000,
    pagado: 10000,
    vencimiento: "2026-10-01",
    periodicidad: "Mensual",
  },
  {
    id: 2,
    cliente: "Martín Gómez",
    telefono: "381 555-1234",
    numero: 2,
    totalCuotas: 3,
    importe: 30000,
    pagado: 0,
    vencimiento: "2026-11-01",
    periodicidad: "Mensual",
  },
  {
    id: 3,
    cliente: "Martín Gómez",
    telefono: "381 555-1234",
    numero: 3,
    totalCuotas: 3,
    importe: 30000,
    pagado: 0,
    vencimiento: "2026-12-01",
    periodicidad: "Mensual",
  },
  {
    id: 4,
    cliente: "Lucía Fernández",
    telefono: "381 555-2345",
    numero: 1,
    totalCuotas: 2,
    importe: 30000,
    pagado: 0,
    vencimiento: "2026-11-01",
    periodicidad: "Quincenal",
  },
  {
    id: 5,
    cliente: "Lucía Fernández",
    telefono: "381 555-2345",
    numero: 2,
    totalCuotas: 2,
    importe: 30000,
    pagado: 0,
    vencimiento: "2026-12-01",
    periodicidad: "Quincenal",
  },
  {
    id: 6,
    cliente: "Juan Pérez",
    telefono: "381 555-3456",
    numero: 1,
    totalCuotas: 1,
    importe: 45000,
    pagado: 45000,
    vencimiento: "2026-10-15",
    periodicidad: "Semanal",
  },
];

const formatoPrecio = (valor: number) =>
  valor.toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  });

const fechaActual = () => {
  const hoy = new Date();
  const anio = hoy.getFullYear();
  const mes = String(hoy.getMonth() + 1).padStart(2, "0");
  const dia = String(hoy.getDate()).padStart(2, "0");
  return `${anio}-${mes}-${dia}`;
};

const obtenerEstado = (cuota: Cuota) => {
  if (cuota.pagado >= cuota.importe) return "Pagada";
  if (cuota.vencimiento < fechaActual()) return "Vencida";
  return "Pendiente";
};

const diasDeMora = (vencimiento: string) => {
  const hoy = new Date(`${fechaActual()}T00:00:00`);
  const fecha = new Date(`${vencimiento}T00:00:00`);

  return Math.max(
    0,
    Math.floor((hoy.getTime() - fecha.getTime()) / 86400000)
  );
};

export default function Cuotas() {
  const [cuotas] = useState<Cuota[]>(cuotasIniciales);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("Todas");
  const [filtroPeriodicidad, setFiltroPeriodicidad] = useState("Todas");
  const [cuotaSeleccionada, setCuotaSeleccionada] = useState<Cuota | null>(null);

  const cuotasFiltradas = useMemo(() => {
    return cuotas.filter((cuota) => {
      const coincideBusqueda =
        `${cuota.cliente} ${cuota.telefono}`
          .toLowerCase()
          .includes(busqueda.toLowerCase());

      const coincideEstado =
        filtroEstado === "Todas" || obtenerEstado(cuota) === filtroEstado;

      const coincidePeriodicidad =
        filtroPeriodicidad === "Todas" ||
        cuota.periodicidad === filtroPeriodicidad;

      return coincideBusqueda && coincideEstado && coincidePeriodicidad;
    });
  }, [cuotas, busqueda, filtroEstado, filtroPeriodicidad]);

  const resumen = useMemo(() => {
    const pendientes = cuotas.filter(
      (cuota) => obtenerEstado(cuota) === "Pendiente"
    ).length;

    const vencidas = cuotas.filter(
      (cuota) => obtenerEstado(cuota) === "Vencida"
    ).length;

    const pagadas = cuotas.filter(
      (cuota) => obtenerEstado(cuota) === "Pagada"
    ).length;

    const saldo = cuotas.reduce(
      (total, cuota) =>
        total + Math.max(0, cuota.importe - cuota.pagado),
      0
    );

    return { pendientes, vencidas, pagadas, saldo };
  }, [cuotas]);

  return (
    <div className="cuotas-page">
      <header className="cuotas-header">
        <div>
          <span className="cuotas-eyebrow">GESTIÓN FINANCIERA</span>
          <h1>Cuotas</h1>
          <p>Organizá los vencimientos y compromisos de pago.</p>
        </div>

        <div className="cuotas-fecha">
          <CalendarDays size={18} />
          <span>{new Date().toLocaleDateString("es-AR")}</span>
        </div>
      </header>

      <section className="cuotas-resumen">
        <article className="cuota-resumen-card">
          <div className="cuota-resumen-icon"><Clock /></div>
          <div>
            <span>Pendientes</span>
            <strong>{resumen.pendientes}</strong>
            <small>Cuotas por cobrar</small>
          </div>
        </article>

        <article className="cuota-resumen-card">
          <div className="cuota-resumen-icon alerta"><AlertTriangle /></div>
          <div>
            <span>Vencidas</span>
            <strong>{resumen.vencidas}</strong>
            <small>Requieren seguimiento</small>
          </div>
        </article>

        <article className="cuota-resumen-card">
          <div className="cuota-resumen-icon pagada"><CheckCircle2 /></div>
          <div>
            <span>Pagadas</span>
            <strong>{resumen.pagadas}</strong>
            <small>Cuotas canceladas</small>
          </div>
        </article>

        <article className="cuota-resumen-card">
          <div className="cuota-resumen-icon"><Wallet /></div>
          <div>
            <span>Saldo pendiente</span>
            <strong>{formatoPrecio(resumen.saldo)}</strong>
            <small>Importe sin cobrar</small>
          </div>
        </article>
      </section>

      <section className="cuotas-panel">
        <div className="cuotas-panel-header">
          <div>
            <h2>Listado de cuotas</h2>
            <p>Consultá el estado de los pagos de cada cliente.</p>
          </div>
          <span className="cuotas-etiqueta">PLAN DE PAGOS</span>
        </div>

        <div className="cuotas-filtros">
          <div className="cuotas-buscador">
            <Search size={18} />
            <input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por cliente o teléfono..."
            />
          </div>

          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
          >
            <option value="Todas">Todos los estados</option>
            <option value="Pendiente">Pendientes</option>
            <option value="Vencida">Vencidas</option>
            <option value="Pagada">Pagadas</option>
          </select>

          <select
            value={filtroPeriodicidad}
            onChange={(e) => setFiltroPeriodicidad(e.target.value)}
          >
            <option value="Todas">Todas las periodicidades</option>
            <option value="Semanal">Semanal</option>
            <option value="Quincenal">Quincenal</option>
            <option value="Mensual">Mensual</option>
          </select>
        </div>

        <div className="cuotas-tabla-contenedor">
          <table className="cuotas-tabla">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Cuota</th>
                <th>Periodicidad</th>
                <th>Vencimiento</th>
                <th>Importe</th>
                <th>Saldo</th>
                <th>Estado</th>
                <th>Detalle</th>
              </tr>
            </thead>

            <tbody>
              {cuotasFiltradas.map((cuota) => {
                const estado = obtenerEstado(cuota);
                const saldo = Math.max(0, cuota.importe - cuota.pagado);

                return (
                  <tr key={cuota.id}>
                    <td>
                      <div className="cuota-cliente">
                        <div className="cuota-avatar">
                          {cuota.cliente.split(" ").map((parte) => parte[0]).slice(0, 2).join("")}
                        </div>
                        <div>
                          <strong>{cuota.cliente}</strong>
                          <small>{cuota.telefono}</small>
                        </div>
                      </div>
                    </td>

                    <td>{cuota.numero} de {cuota.totalCuotas}</td>
                    <td>{cuota.periodicidad}</td>
                    <td>
                      {new Date(`${cuota.vencimiento}T00:00:00`).toLocaleDateString("es-AR")}
                    </td>
                    <td>{formatoPrecio(cuota.importe)}</td>
                    <td>
                      <strong className={saldo > 0 ? "cuota-saldo" : "cuota-pagada"}>
                        {formatoPrecio(saldo)}
                      </strong>
                    </td>
                    <td>
                      <span className={`cuota-estado ${estado.toLowerCase()}`}>
                        {estado}
                      </span>
                    </td>
                    <td>
                      <button
                        className="cuota-ver-btn"
                        onClick={() => setCuotaSeleccionada(cuota)}
                      >
                        <Eye size={16} />
                        Ver
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {cuotasFiltradas.length === 0 && (
            <div className="cuotas-vacio">
              <Receipt size={32} />
              <strong>No se encontraron cuotas</strong>
              <span>Probá cambiando los filtros de búsqueda.</span>
            </div>
          )}
        </div>
      </section>

      <section className="cuotas-informacion">
        <Clock size={19} />
        <div>
          <strong>Recordatorio de vencimientos</strong>
          <p>
            Las fechas y periodicidades se configurarán desde la cuenta
            corriente. El administrador podrá establecer los vencimientos
            de cada cliente.
          </p>
        </div>
      </section>

      {cuotaSeleccionada && (
        <div className="cuota-modal-fondo">
          <div className="cuota-modal">
            <button
              className="cuota-modal-cerrar"
              onClick={() => setCuotaSeleccionada(null)}
              aria-label="Cerrar"
            >
              <X size={20} />
            </button>

            <div className="cuota-modal-icono"><Receipt size={25} /></div>
            <h2>Detalle de cuota</h2>
            <p>Información del compromiso de pago.</p>

            <div className="cuota-detalle">
              <div>
                <span><UserRound size={15} /> Cliente</span>
                <strong>{cuotaSeleccionada.cliente}</strong>
              </div>
              <div>
                <span>Cuota</span>
                <strong>{cuotaSeleccionada.numero} de {cuotaSeleccionada.totalCuotas}</strong>
              </div>
              <div>
                <span>Periodicidad</span>
                <strong>{cuotaSeleccionada.periodicidad}</strong>
              </div>
              <div>
                <span>Vencimiento</span>
                <strong>
                  {new Date(`${cuotaSeleccionada.vencimiento}T00:00:00`).toLocaleDateString("es-AR")}
                </strong>
              </div>
              <div>
                <span>Importe</span>
                <strong>{formatoPrecio(cuotaSeleccionada.importe)}</strong>
              </div>
              <div>
                <span>Pagado</span>
                <strong>{formatoPrecio(cuotaSeleccionada.pagado)}</strong>
              </div>
              <div>
                <span>Saldo pendiente</span>
                <strong className="cuota-saldo">
                  {formatoPrecio(Math.max(0, cuotaSeleccionada.importe - cuotaSeleccionada.pagado))}
                </strong>
              </div>
              {obtenerEstado(cuotaSeleccionada) === "Vencida" && (
                <div>
                  <span>Días de mora</span>
                  <strong>{diasDeMora(cuotaSeleccionada.vencimiento)} días</strong>
                </div>
              )}
            </div>

            <button
              className="cuota-modal-boton"
              onClick={() => setCuotaSeleccionada(null)}
            >
              Cerrar detalle
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
