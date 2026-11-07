
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Productos from "./pages/Productos";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Acceso */}
        <Route path="/login" element={<Login />} />

        {/* Panel principal */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Productos */}
        <Route path="/productos" element={<Productos />} />

        {/* Ruta inicial */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Ruta no encontrada */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
