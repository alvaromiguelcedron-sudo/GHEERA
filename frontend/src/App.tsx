
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import MainLayout from "./components/MainLayout";

import Productos from "./pages/Productos";
import Stock from "./pages/Stock";
import Ventas from "./pages/Ventas";
import Clientes from "./pages/Clientes";
import CuentaCorriente from "./pages/CuentaCorriente";
import Cuotas from "./pages/Cuotas";
import Proveedores from "./pages/Proveedores";
import Compras from "./pages/Compras";
import Caja from "./pages/Caja";
import Reportes from "./pages/Reportes";
import Configuracion from "./pages/Configuracion";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/productos" element={<Productos />} />
          <Route path="/stock" element={<Stock />} />
          <Route path="/ventas" element={<Ventas />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/cuenta-corriente" element={<CuentaCorriente />} />
          <Route path="/cuotas" element={<Cuotas />} />
          <Route path="/proveedores" element={<Proveedores />} />
          <Route path="/compras" element={<Compras />} />
          <Route path="/caja" element={<Caja />} />
          <Route path="/reportes" element={<Reportes />} />
          <Route path="/configuracion" element={<Configuracion />} />
        </Route>

        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
