
import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu, X } from "lucide-react";
import Sidebar from "./Sidebar";

export default function MainLayout() {
  const [menuAbierto, setMenuAbierto] = useState(false);

  const cerrarMenu = () => {
    setMenuAbierto(false);
  };

  return (
    <main className="dashboard">
      <Sidebar
        abierto={menuAbierto}
        onNavigate={cerrarMenu}
      />

      {menuAbierto && (
        <button
          type="button"
          className="sidebar-overlay"
          aria-label="Cerrar menú"
          onClick={cerrarMenu}
        />
      )}

      <button
        type="button"
        className="mobile-menu-toggle"
        aria-label={menuAbierto ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={menuAbierto}
        onClick={() => setMenuAbierto(!menuAbierto)}
      >
        {menuAbierto ? <X size={23} /> : <Menu size={23} />}
      </button>

      <section className="dashboard-content">
        <Outlet />
      </section>
    </main>
  );
}
