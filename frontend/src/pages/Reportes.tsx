
import { useState } from "react";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingBag,
  Package,
  AlertTriangle,
  Users,
  CalendarDays,
  ArrowUpRight,
  ArrowDownRight,
  FileBarChart,
} from "lucide-react";
import "./Reportes.css";

const ventasPorMes = [
  { mes: "Jun", ventas: 45 },
  { mes: "Jul", ventas: 65 },
  { mes: "Ago", ventas: 52 },
  { mes: "Sep", ventas: 78 },
  { mes: "Oct", ventas: 68 },
  { mes: "Nov", ventas: 90 },
];

const productosMasVendidos = [
  { nombre: "Remera básica", unidades: 85, porcentaje: 95 },
  { nombre: "Pantalón deportivo", unidades: 62, porcentaje: 70 },
  { nombre: "Buzo oversize", unidades: 48, porcentaje: 55 },
  { nombre: "Short deportivo", unidades: 35, porcentaje: 40 },
  { nombre: "Musculosa", unidades: 24, porcentaje: 28 },
];

const productosStockBajo = [
  { nombre: "Zapatillas deportivas", codigo: "ZAP-004", stock: 2 },
  { nombre: "Buzo oversize", codigo: "BUZ-003", stock: 3 },
  { nombre: "Pantalón deportivo", codigo: "PAN-002", stock: 4 },
];

const deudasPendientes = [
  { cliente: "Juan Pérez", vencimiento: "05/11/2026", monto: 45000 },
  { cliente: "María Gómez", vencimiento: "08/11/2026", monto: 28000 },
  { cliente: "Carlos López", vencimiento: "10/11/2026", monto: 17500 },
];

export default function Reportes() {
  const [periodo, setPeriodo] = useState("mes");

  const formatoPrecio = (valor: number) =>
    valor.toLocaleString("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    });

  const periodoTexto =
    periodo === "dia"
      ? "del día"
      : periodo === "semana"
        ? "de la semana"
        : "del mes";

  return (
    <div className="reportes-page">
      <header className="reportes-header">
        <div>
          <span className="reportes-eyebrow">ANÁLISIS DEL NEGOCIO</span>
          <h1>Reportes</h1>
          <p>Consultá el rendimiento y los indicadores de tu negocio.</p>
        </div>

        <div className="reportes-header-icon">
          <FileBarChart size={25} />
        </div>
      </header>

      <section className="reportes-filtros">
        <div className="reportes-filtro-titulo">
          <CalendarDays size={19} />
          <span>Período de consulta</span>
        </div>

        <div className="reportes-periodos">
          <button
            type="button"
            className={periodo === "dia" ? "activo" : ""}
            onClick={() => setPeriodo("dia")}
          >
            Hoy
          </button>
          <button
            type="button"
            className={periodo === "semana" ? "activo" : ""}
            onClick={() => setPeriodo("semana")}
          >
            Esta semana
          </button>
          <button
            type="button"
            className={periodo === "mes" ? "activo" : ""}
            onClick={() => setPeriodo("mes")}
          >
            Este mes
          </button>
        </div>
      </section>

      <section className="reportes-indicadores">
        <article className="reporte-card">
          <div className="reporte-card-superior">
            <div className="reporte-icono ventas">
              <DollarSign size={21} />
            </div>
            <span className="reporte-variacion positiva">
              <ArrowUpRight size={15} /> 12%
            </span>
          </div>
          <span className="reporte-etiqueta">Ventas {periodoTexto}</span>
          <strong className="reporte-valor">{formatoPrecio(485000)}</strong>
          <small>Comparación ilustrativa</small>
        </article>

        <article className="reporte-card">
          <div className="reporte-card-superior">
            <div className="reporte-icono operaciones">
              <ShoppingBag size={21} />
            </div>
            <span className="reporte-variacion positiva">
              <ArrowUpRight size={15} /> 8%
            </span>
          </div>
          <span className="reporte-etiqueta">Cantidad de ventas</span>
          <strong className="reporte-valor">126</strong>
          <small>Operaciones de ejemplo</small>
        </article>

        <article className="reporte-card">
          <div className="reporte-card-superior">
            <div className="reporte-icono ingresos">
              <TrendingUp size={21} />
            </div>
            <span className="reporte-variacion positiva">
              <ArrowUpRight size={15} /> 5%
            </span>
          </div>
          <span className="reporte-etiqueta">Ingresos</span>
          <strong className="reporte-valor">{formatoPrecio(620000)}</strong>
          <small>Datos de ejemplo</small>
        </article>

        <article className="reporte-card">
          <div className="reporte-card-superior">
            <div className="reporte-icono egresos">
              <TrendingDown size={21} />
            </div>
            <span className="reporte-variacion negativa">
              <ArrowDownRight size={15} /> 3%
            </span>
          </div>
          <span className="reporte-etiqueta">Egresos</span>
          <strong className="reporte-valor">{formatoPrecio(215000)}</strong>
          <small>Datos de ejemplo</small>
        </article>
      </section>

      <section className="reportes-graficos">
        <article className="reportes-panel reporte-grafico-panel">
          <div className="reportes-panel-header">
            <div>
              <h2>Evolución de ventas</h2>
              <p>Comportamiento de las ventas durante los últimos meses.</p>
            </div>
            <BarChart3 size={21} />
          </div>

          <div className="grafico-barras">
            {ventasPorMes.map((dato) => (
              <div className="grafico-columna" key={dato.mes}>
                <span className="grafico-valor">{dato.ventas}%</span>
                <div className="grafico-barra-fondo">
                  <div
                    className="grafico-barra"
                    style={{ height: `${dato.ventas}%` }}
                  />
                </div>
                <span className="grafico-mes">{dato.mes}</span>
              </div>
            ))}
          </div>
          <p className="grafico-aclaracion">
            Valores ilustrativos, pendientes de conectar con las ventas reales.
          </p>
        </article>

        <article className="reportes-panel reporte-resultados-panel">
          <div className="reportes-panel-header">
            <div>
              <h2>Resumen financiero</h2>
              <p>Balance ilustrativo del período seleccionado.</p>
            </div>
            <DollarSign size={21} />
          </div>

          <div className="resumen-financiero">
            <div>
              <span>Ingresos</span>
              <strong className="texto-positivo">
                {formatoPrecio(620000)}
              </strong>
            </div>
            <div>
              <span>Egresos</span>
              <strong className="texto-negativo">
                {formatoPrecio(215000)}
              </strong>
            </div>
            <div className="resumen-balance">
              <span>Resultado</span>
              <strong>{formatoPrecio(405000)}</strong>
            </div>
          </div>

          <div className="balance-barra">
            <div className="balance-ingresos" />
            <div className="balance-egresos" />
          </div>

          <div className="balance-leyenda">
            <span><i className="punto-ingreso" /> Ingresos</span>
            <span><i className="punto-egreso" /> Egresos</span>
          </div>
        </article>
      </section>

      <section className="reportes-panel productos-reporte-panel">
        <div className="reportes-panel-header">
          <div>
            <h2>Productos más vendidos</h2>
            <p>Ranking ilustrativo de productos por unidades vendidas.</p>
          </div>
          <Package size={21} />
        </div>

        <div className="ranking-productos">
          {productosMasVendidos.map((producto, index) => (
            <div className="ranking-producto" key={producto.nombre}>
              <span className="ranking-numero">{index + 1}</span>
              <div className="ranking-info">
                <div className="ranking-textos">
                  <strong>{producto.nombre}</strong>
                  <span>{producto.unidades} unidades</span>
                </div>
                <div className="ranking-barra-fondo">
                  <div
                    className="ranking-barra"
                    style={{ width: `${producto.porcentaje}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="reportes-inferiores">
        <article className="reportes-panel alertas-panel">
          <div className="reportes-panel-header">
            <div>
              <h2>Alertas de stock</h2>
              <p>Productos que necesitan reposición.</p>
            </div>
            <AlertTriangle size={21} />
          </div>

          <div className="alertas-lista">
            {productosStockBajo.map((producto) => (
              <div className="alerta-stock-item" key={producto.codigo}>
                <div className="alerta-stock-icon">
                  <Package size={18} />
                </div>
                <div className="alerta-stock-info">
                  <strong>{producto.nombre}</strong>
                  <span>{producto.codigo}</span>
                </div>
                <span className="alerta-stock-cantidad">
                  {producto.stock} unidades
                </span>
              </div>
            ))}
          </div>
        </article>

        <article className="reportes-panel deudas-panel">
          <div className="reportes-panel-header">
            <div>
              <h2>Deudas pendientes</h2>
              <p>Ejemplos de cuentas con vencimientos.</p>
            </div>
            <Users size={21} />
          </div>

          <div className="deudas-lista">
            {deudasPendientes.map((deuda) => (
              <div className="deuda-item" key={deuda.cliente}>
                <div className="deuda-info">
                  <strong>{deuda.cliente}</strong>
                  <span>Vencimiento: {deuda.vencimiento}</span>
                </div>
                <strong className="deuda-monto">
                  {formatoPrecio(deuda.monto)}
                </strong>
              </div>
            ))}
          </div>
        </article>
      </section>

      <footer className="reportes-pie">
        <BarChart3 size={16} />
        <span>
          Reportes de demostración. Los indicadores se conectarán a la base de
          datos durante la etapa de integración.
        </span>
      </footer>
    </div>
  );
}
