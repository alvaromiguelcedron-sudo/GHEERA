
import { NavLink } from "react-router-dom";
import {
  Boxes,
  LayoutDashboard,
  Package,
  Warehouse,
  ShoppingCart,
  Users,
  Wallet,
  Truck,
  ShoppingBag,
  ClipboardList,
  FileBarChart,
  CreditCard,
  Settings,
  LogOut,
} from "lucide-react";

interface SidebarProps {
  abierto: boolean;
  onNavigate: () => void;
}

const menu = [
  { nombre: "Inicio", ruta: "/dashboard", icono: LayoutDashboard },
  { nombre: "Productos", ruta: "/productos", icono: Package },
  { nombre: "Stock", ruta: "/stock", icono: Warehouse },
  { nombre: "Ventas", ruta: "/ventas", icono: ShoppingCart },
  { nombre: "Clientes", ruta: "/clientes", icono: Users },
  { nombre: "Cuenta corriente", ruta: "/cuenta-corriente", icono: Wallet },
  { nombre: "Cuotas", ruta: "/cuotas", icono: CreditCard },
  { nombre: "Proveedores", ruta: "/proveedores", icono: Truck },
  { nombre: "Compras", ruta: "/compras", icono: ShoppingBag },
  { nombre: "Caja", ruta: "/caja", icono: ClipboardList },
  { nombre: "Reportes", ruta: "/reportes", icono: FileBarChart },
];

export default function Sidebar({ abierto, onNavigate }: SidebarProps) {
  return (
    <aside className={`sidebar ${abierto ? "sidebar-open" : ""}`}>
      <div className="sidebar-brand">
        <div className="brand-icon">
          <Boxes size={27} />
        </div>

        <div>
          <h2>GHEERA</h2>
          <span>Gestión comercial</span>
        </div>
      </div>

      <div className="sidebar-section">
        <span className="section-title">MENÚ PRINCIPAL</span>

        <nav className="sidebar-nav">
          {menu.map((item) => {
            const Icon = item.icono;

            return (
              <NavLink
                key={item.ruta}
                to={item.ruta}
                onClick={onNavigate}
                className={({ isActive }) =>
                  `nav-item ${isActive ? "active" : ""}`
                }
              >
                <Icon size={20} />
                <span>{item.nombre}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="sidebar-bottom">
        <NavLink
          to="/configuracion"
          onClick={onNavigate}
          className={({ isActive }) =>
            `nav-item ${isActive ? "active" : ""}`
          }
        >
          <Settings size={20} />
          <span>Configuración</span>
        </NavLink>

        <NavLink
          to="/login"
          onClick={onNavigate}
          className="nav-item logout"
        >
          <LogOut size={20} />
          <span>Cerrar sesión</span>
        </NavLink>
      </div>
    </aside>
  );
}
