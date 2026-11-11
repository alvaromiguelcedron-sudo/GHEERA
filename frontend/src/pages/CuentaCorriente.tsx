
import { useMemo, useState } from "react";
import {
  Wallet,
  Search,
  Users,
  AlertTriangle,
  CalendarDays,
  Plus,
  Eye,
  X,
  CreditCard,
  Clock,
  Receipt,
} from "lucide-react";

import "./CuentaCorriente.css";

interface Cuota {
  id: number;
  numero: number;
  vencimiento: string;
  importe: number;
  pagado: number;
}

interface Cuenta {
  id: number;
  cliente: string;
  telefono: string;
  capital: number;
  fechaInicio: string;
  cuotas: Cuota[];
}

const cuentasIniciales: Cuenta[] = [
  {
    id: 1,
    cliente: "Martín Gómez",
    telefono: "381 555-1234",
    capital: 90000,
    fechaInicio: "2026-09-01",
    cuotas: [
      { id: 1, numero: 1, vencimiento: "2026-10-01", importe: 30000, pagado: 10000 },
      { id: 2, numero: 2, vencimiento: "2026-11-01", importe: 30000, pagado: 0 },
      { id: 3, numero: 3, vencimiento: "2026-12-01", importe: 30000, pagado: 0 },
    ],
  },
  {
    id: 2,
    cliente: "Lucía Fernández",
    telefono: "381 555-2345",
    capital: 60000,
    fechaInicio: "2026-10-01",
    cuotas: [
      { id: 4, numero: 1, vencimiento: "2026-11-01", importe: 30000, pagado: 0 },
      { id: 5, numero: 2, vencimiento: "2026-12-01", importe: 30000, pagado: 0 },
    ],
  },
  {
    id: 3,
    cliente: "Juan Pérez",
    telefono: "381 555-3456",
    capital: 45000,
    fechaInicio: "2026-09-15",
    cuotas: [
      { id: 6, numero: 1, vencimiento: "2026-10-15", importe: 45000, pagado: 15000 },
    ],
  },
];

const formatoPrecio = (valor: number) =>
  valor.toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  });

const fechaHoy = () => {
  const fecha = new Date();
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return `${anio}-${mes}-${dia}`;
};

const calcularDiasMora = (vencimiento: string) => {
  const hoy = new Date(`${fechaHoy()}T00:00:00`);
  const fechaVencimiento = new Date(`${vencimiento}T00:00:00`);
  const diferencia = hoy.getTime() - fechaVencimiento.getTime();

  return Math.max(0, Math.floor(diferencia / 86400000));
};

const calcularRecargo = (saldo: number, dias: number) =>
  saldo * 0.0005 * dias;

export default function CuentaCorriente() {
  const [cuentas, setCuentas] = useState<Cuenta[]>(cuentasIniciales);
  const [busqueda, setBusqueda] = useState("");
  const [cuentaSeleccionada, setCuentaSeleccionada] = useState<Cuenta | null>(null);
  const [cuotaSeleccionada, setCuotaSeleccionada] = useState<{
    cuentaId: number;
    cuotaId: number;
    saldo: number;
  } | null>(null);
  const [pago, setPago] = useState("");
  const [mensaje, setMensaje] = useState("");

  const cuentasFiltradas = useMemo(
    () =>
      cuentas.filter((cuenta) =>
        `${cuenta.cliente} ${cuenta.telefono}`
          .toLowerCase()
          .includes(busqueda.toLowerCase())
      ),
    [cuentas, busqueda]
  );

  const resumen = useMemo(() => {
    let deuda = 0;
    let recargos = 0;
    let cuotasVencidas = 0;

    cuentas.forEach((cuenta) => {
      cuenta.cuotas.forEach((cuota) => {
        const saldo = Math.max(0, cuota.importe - cuota.pagado);
        const dias = calcularDiasMora(cuota.vencimiento);

        deuda += saldo;

        if (saldo > 0 && dias > 0) {
          cuotasVencidas += 1;
          recargos += calcularRecargo(saldo, dias);
        }
      });
    });

    return {
      deuda,
      recargos,
      cuotasVencidas,
      clientes: cuentas.length,
    };
  }, [cuentas]);

  const registrarPago = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!cuotaSeleccionada) return;

    const importePago = Number(pago);

    if (!Number.isFinite(importePago) || importePago <= 0) {
      setMensaje("Ingresá un importe válido.");
      return;
    }

    if (importePago > cuotaSeleccionada.saldo) {
      setMensaje("El pago no puede superar el saldo pendiente de la cuota.");
      return;
    }

    setCuentas((actuales) =>
      actuales.map((cuenta) =>
        cuenta.id === cuotaSeleccionada.cuentaId
          ? {
              ...cuenta,
              cuotas: cuenta.cuotas.map((cuota) =>
                cuota.id === cuotaSeleccionada.cuotaId
                  ? { ...cuota, pagado: cuota.pagado + importePago }
                  : cuota
              ),
            }
          : cuenta
      )
    );

    setCuotaSeleccionada(null);
    setPago("");
    setMensaje("");
  };

  const abrirPago = (cuenta: Cuenta, cuota: Cuota) => {
    setMensaje("");
    setPago("");
    setCuentaSeleccionada(cuenta);
    setCuotaSeleccionada({
      cuentaId: cuenta.id,
      cuotaId: cuota.id,
      saldo: Math.max(0, cuota.importe - cuota.pagado),
    });
  };

  const cerrarModales = () => {
    setCuentaSeleccionada(null);
    setCuotaSeleccionada(null);
    setPago("");
    setMensaje("");
  };

  return (
    <div className="cc-page">
      <header className="cc-header">
        <div>
          <span className="cc-eyebrow">GESTIÓN FINANCIERA</span>
          <h1>Cuenta corriente</h1>
          <p>Controlá las deudas, cuotas y pagos de tus clientes.</p>
        </div>

        <div className="cc-tasa">
          <Wallet size={18} />
          <span>Recargo diario: <strong>0,05 %</strong></span>
        </div>
      </header>

      <section className="cc-resumen">
        <article className="cc-resumen-card">
          <div className="cc-resumen-icon"><Wallet /></div>
          <div>
            <span>Deuda pendiente</span>
            <strong>{formatoPrecio(resumen.deuda)}</strong>
            <small>Saldo de cuotas sin pagar</small>
          </div>
        </article>

        <article className="cc-resumen-card">
          <div className="cc-resumen-icon cc-icon-alerta"><AlertTriangle /></div>
          <div>
            <span>Cuotas vencidas</span>
            <strong>{resumen.cuotasVencidas}</strong>
            <small>Con saldo pendiente y mora</small>
          </div>
        </article>

        <article className="cc-resumen-card">
          <div className="cc-resumen-icon"><CalendarDays /></div>
          <div>
            <span>Recargos acumulados</span>
            <strong>{formatoPrecio(resumen.recargos)}</strong>
            <small>Estimación sobre saldos vencidos</small>
          </div>
        </article>

        <article className="cc-resumen-card">
          <div className="cc-resumen-icon"><Users /></div>
          <div>
            <span>Cuentas registradas</span>
            <strong>{resumen.clientes}</strong>
            <small>Clientes con cuenta corriente</small>
          </div>
        </article>
      </section>

      <section className="cc-panel">
        <div className="cc-panel-header">
          <div>
            <h2>Cuentas de clientes</h2>
            <p>Consultá saldos, cuotas y vencimientos.</p>
          </div>
          <span className="cc-etiqueta">CUENTAS ACTIVAS</span>
        </div>

        <div className="cc-buscador">
          <Search size={19} />
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar cliente o teléfono..."
          />
        </div>

        <div className="cc-tabla-contenedor">
          <table className="cc-tabla">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Capital inicial</th>
                <th>Saldo pendiente</th>
                <th>Cuotas pendientes</th>
                <th>Estado</th>
                <th>Detalle</th>
              </tr>
            </thead>
            <tbody>
              {cuentasFiltradas.map((cuenta) => {
                const saldo = cuenta.cuotas.reduce(
                  (total, cuota) => total + Math.max(0, cuota.importe - cuota.pagado),
                  0
                );

                const pendientes = cuenta.cuotas.filter(
                  (cuota) => cuota.pagado < cuota.importe
                ).length;

                const vencida = cuenta.cuotas.some(
                  (cuota) =>
                    cuota.pagado < cuota.importe &&
                    calcularDiasMora(cuota.vencimiento) > 0
                );

                return (
                  <tr key={cuenta.id}>
                    <td>
                      <div className="cc-cliente">
                        <div className="cc-avatar">
                          {cuenta.cliente.split(" ").map((parte) => parte[0]).slice(0, 2).join("")}
                        </div>
                        <div>
                          <strong>{cuenta.cliente}</strong>
                          <small>{cuenta.telefono}</small>
                        </div>
                      </div>
                    </td>
                    <td>{formatoPrecio(cuenta.capital)}</td>
                    <td>
                      <strong className={saldo > 0 ? "cc-saldo" : "cc-pagado"}>
                        {formatoPrecio(saldo)}
                      </strong>
                    </td>
                    <td>{pendientes}</td>
                    <td>
                      <span className={`cc-estado ${vencida ? "vencida" : saldo > 0 ? "al-dia" : "cancelada"}`}>
                        {vencida ? "Con mora" : saldo > 0 ? "Pendiente" : "Cancelada"}
                      </span>
                    </td>
                    <td>
                      <button
                        className="cc-ver-btn"
                        onClick={() => setCuentaSeleccionada(cuenta)}
                      >
                        <Eye size={16} />
                        Ver cuenta
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {cuentasFiltradas.length === 0 && (
            <div className="cc-vacio">
              <Users size={32} />
              <strong>No se encontraron cuentas</strong>
              <span>Probá con otro nombre o teléfono.</span>
            </div>
          )}
        </div>
      </section>

      <section className="cc-nota">
        <AlertTriangle size={19} />
        <div>
          <strong>Regla de cálculo de mora</strong>
          <p>
            El recargo de ejemplo es del 0,05 % diario sobre el saldo pendiente
            de cada cuota, desde el día posterior a su vencimiento. La fecha de
            vencimiento será definida por el administrador.
          </p>
        </div>
      </section>

      {cuentaSeleccionada && (
        <div className="cc-modal-fondo">
          <div className="cc-modal cc-modal-grande">
            <button className="cc-cerrar" onClick={cerrarModales}>
              <X size={20} />
            </button>

            <div className="cc-modal-icono"><Receipt size={25} /></div>
            <h2>{cuentaSeleccionada.cliente}</h2>
            <p>Detalle de cuotas y pagos de la cuenta.</p>

            <div className="cc-cuotas-lista">
              {cuentaSeleccionada.cuotas.map((cuota) => {
                const saldo = Math.max(0, cuota.importe - cuota.pagado);
                const dias = calcularDiasMora(cuota.vencimiento);
                const recargo = saldo > 0 && dias > 0
                  ? calcularRecargo(saldo, dias)
                  : 0;

                return (
                  <article className="cc-cuota-card" key={cuota.id}>
                    <div className="cc-cuota-titulo">
                      <strong>Cuota {cuota.numero}</strong>
                      <span className={`cc-estado ${saldo === 0 ? "cancelada" : dias > 0 ? "vencida" : "al-dia"}`}>
                        {saldo === 0 ? "Pagada" : dias > 0 ? "Vencida" : "Pendiente"}
                      </span>
                    </div>

                    <div className="cc-cuota-datos">
                      <span>Vencimiento: <strong>{new Date(`${cuota.vencimiento}T00:00:00`).toLocaleDateString("es-AR")}</strong></span>
                      <span>Importe: <strong>{formatoPrecio(cuota.importe)}</strong></span>
                      <span>Pagado: <strong>{formatoPrecio(cuota.pagado)}</strong></span>
                      <span>Saldo: <strong>{formatoPrecio(saldo)}</strong></span>
                      {dias > 0 && saldo > 0 && (
                        <>
                          <span>Días de mora: <strong>{dias}</strong></span>
                          <span>Recargo estimado: <strong>{formatoPrecio(recargo)}</strong></span>
                        </>
                      )}
                    </div>

                    {saldo > 0 && (
                      <button
                        className="cc-pagar-btn"
                        onClick={() => abrirPago(cuentaSeleccionada, cuota)}
                      >
                        <CreditCard size={16} />
                        Registrar pago
                      </button>
                    )}
                  </article>
                );
              })}
            </div>

            <button className="cc-cancelar-btn" onClick={cerrarModales}>
              Cerrar detalle
            </button>
          </div>
        </div>
      )}

      {cuotaSeleccionada && (
        <div className="cc-modal-fondo">
          <form className="cc-modal cc-pago-modal" onSubmit={registrarPago}>
            <button type="button" className="cc-cerrar" onClick={cerrarModales}>
              <X size={20} />
            </button>

            <div className="cc-modal-icono"><CreditCard size={25} /></div>
            <h2>Registrar pago</h2>
            <p>Ingresá el importe que abonó el cliente.</p>

            <div className="cc-pago-saldo">
              Saldo pendiente
              <strong>{formatoPrecio(cuotaSeleccionada.saldo)}</strong>
            </div>

            <label className="cc-pago-label">
              Importe recibido
              <input
                type="number"
                min="1"
                max={cuotaSeleccionada.saldo}
                step="0.01"
                required
                value={pago}
                onChange={(e) => setPago(e.target.value)}
                placeholder="Ej: 15000"
              />
            </label>

            {mensaje && <p className="cc-error">{mensaje}</p>}

            <button className="cc-pagar-btn" type="submit">
              <Plus size={17} />
              Confirmar pago en maqueta
            </button>

            <small className="cc-aviso-modal">
              Este movimiento es temporal y todavía no se guarda en la base de datos.
            </small>
          </form>
        </div>
      )}
    </div>
  );
}
