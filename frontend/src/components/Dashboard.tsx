
import {
  Boxes,
  ShoppingCart,
  Package,
  Wallet,
  Bell,
  Search,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  ClipboardList,
} from "lucide-react";

import "./Dashboard.css";

export default function Dashboard() {
  return (
    <>
      <header className="dashboard-header">
        <div className="header-title">
          <div>
            <h1>Panel principal</h1>
            <p>Bienvenido a GHEERA. Este es el resumen de tu negocio.</p>
          </div>
        </div>

        <div className="header-actions">
          <div className="search-box">
            <Search size={19} />
            <input placeholder="Buscar..." />
          </div>

          <button
            className="notification-button"
            type="button"
            aria-label="Notificaciones"
          >
            <Bell size={21} />
            <span className="notification-dot" />
          </button>

          <div className="user-profile">
            <div className="user-avatar">A</div>
            <div>
              <strong>Administrador</strong>
              <span>Usuario principal</span>
            </div>
          </div>
        </div>
      </header>

      <div className="welcome-banner">
        <div>
          <span className="welcome-tag">RESUMEN GENERAL</span>
          <h2>¡Hola, bienvenido!</h2>
          <p>Controlá y administrá tu negocio desde un solo lugar.</p>
        </div>

        <div className="welcome-decoration">
          <Boxes size={85} strokeWidth={1.2} />
        </div>
      </div>

      <div className="section-heading">
        <div>
          <h2>Resumen del negocio</h2>
          <p>Indicadores generales de gestión</p>
        </div>
      </div>

      <div className="stats-grid">
        <article className="stat-card">
          <div className="stat-top">
            <span className="stat-icon blue">
              <ShoppingCart size={22} />
            </span>
            <span className="stat-label">Ventas de hoy</span>
          </div>
          <h3>$ 0,00</h3>
          <div className="stat-footer">
            <TrendingUp size={16} />
            <span>Sin movimientos registrados</span>
          </div>
        </article>

        <article className="stat-card">
          <div className="stat-top">
            <span className="stat-icon cyan">
              <Package size={22} />
            </span>
            <span className="stat-label">Productos</span>
          </div>
          <h3>0</h3>
          <div className="stat-footer neutral">
            <span>Productos registrados</span>
          </div>
        </article>

        <article className="stat-card">
          <div className="stat-top">
            <span className="stat-icon orange">
              <AlertTriangle size={22} />
            </span>
            <span className="stat-label">Stock bajo</span>
          </div>
          <h3>0</h3>
          <div className="stat-footer warning">
            <AlertTriangle size={16} />
            <span>Productos por revisar</span>
          </div>
        </article>

        <article className="stat-card">
          <div className="stat-top">
            <span className="stat-icon green">
              <Wallet size={22} />
            </span>
            <span className="stat-label">Caja actual</span>
          </div>
          <h3>$ 0,00</h3>
          <div className="stat-footer neutral">
            <span>Saldo de caja</span>
          </div>
        </article>
      </div>

      <div className="bottom-grid">
        <section className="content-card">
          <div className="card-heading">
            <div>
              <h3>Movimientos recientes</h3>
              <p>Últimas operaciones del negocio</p>
            </div>
            <ArrowUpRight size={21} />
          </div>

          <div className="empty-state">
            <ClipboardList size={38} />
            <strong>Sin movimientos todavía</strong>
            <span>Cuando registres operaciones aparecerán aquí.</span>
          </div>
        </section>

        <section className="content-card">
          <div className="card-heading">
            <div>
              <h3>Actividad del negocio</h3>
              <p>Estado general</p>
            </div>
          </div>

          <div className="activity-item">
            <span className="activity-icon green">
              <TrendingUp size={19} />
            </span>
            <div>
              <strong>Ventas</strong>
              <span>Sin datos registrados</span>
            </div>
          </div>

          <div className="activity-item">
            <span className="activity-icon blue">
              <Package size={19} />
            </span>
            <div>
              <strong>Inventario</strong>
              <span>Sin datos registrados</span>
            </div>
          </div>

          <div className="activity-item">
            <span className="activity-icon orange">
              <Wallet size={19} />
            </span>
            <div>
              <strong>Cuentas pendientes</strong>
              <span>Sin datos registrados</span>
            </div>
          </div>
        </section>
      </div>

      <footer className="dashboard-footer">
        GHEERA · Sistema de gestión comercial
      </footer>
    </>
  );
}
