
import { useState } from "react";
import {
  Package,
  Boxes,
  AlertTriangle,
  PackageX,
  Search,
  Plus,
  ArrowDownToLine,
  ArrowUpFromLine,
  RefreshCw,
  ClipboardList,
} from "lucide-react";

import "./Stock.css";

export default function Stock() {
  const [busqueda, setBusqueda] = useState("");
  const [operacion, setOperacion] = useState("");

  return (
    <main className="stock-page">
      <header className="stock-header">
        <div>
          <h1>Control de existencias</h1>
          <p>Administrá y controlá el inventario de tu negocio.</p>
        </div>

        <button
          className="stock-btn-ajuste"
          onClick={() => setOperacion("ajuste")}
        >
          <RefreshCw size={19} />
          Ajustar stock
        </button>
      </header>

      <section className="stock-resumen">
        <article className="stock-card">
          <span className="stock-icono azul">
            <Package size={23} />
          </span>
          <div>
            <p>Productos registrados</p>
            <h2>—</h2>
          </div>
        </article>

        <article className="stock-card">
          <span className="stock-icono verde">
            <Boxes size={23} />
          </span>
          <div>
            <p>Unidades disponibles</p>
            <h2>—</h2>
          </div>
        </article>

        <article className="stock-card">
          <span className="stock-icono naranja">
            <AlertTriangle size={23} />
          </span>
          <div>
            <p>Stock bajo</p>
            <h2>—</h2>
          </div>
        </article>

        <article className="stock-card">
          <span className="stock-icono rojo">
            <PackageX size={23} />
          </span>
          <div>
            <p>Sin existencias</p>
            <h2>—</h2>
          </div>
        </article>
      </section>

      <section className="stock-operaciones">
        <div className="stock-seccion-titulo">
          <h2>Operaciones de inventario</h2>
          <p>Gestioná los movimientos de tus productos.</p>
        </div>

        <div className="stock-botones">
          <button
            className="stock-operacion entrada"
            onClick={() => setOperacion("entrada")}
          >
            <ArrowDownToLine size={21} />
            Registrar entrada
          </button>

          <button
            className="stock-operacion salida"
            onClick={() => setOperacion("salida")}
          >
            <ArrowUpFromLine size={21} />
            Registrar salida
          </button>

          <button
            className="stock-operacion ajuste"
            onClick={() => setOperacion("ajuste")}
          >
            <RefreshCw size={21} />
            Ajustar cantidades
          </button>
        </div>
      </section>

      <section className="stock-listado">
        <div className="stock-toolbar">
          <div>
            <h2>Existencias actuales</h2>
            <p>Consultá las cantidades disponibles.</p>
          </div>

          <div className="stock-busqueda">
            <Search size={19} />
            <input
              placeholder="Buscar producto o código..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
        </div>

        <div className="stock-tabla-contenedor">
          <table className="stock-tabla">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Código</th>
                <th>Categoría</th>
                <th>Stock actual</th>
                <th>Estado</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td colSpan={5} className="stock-vacio">
                  <ClipboardList size={38} />
                  <strong>Inventario pendiente de cargar</strong>
                  <span>
                    Los productos y sus cantidades aparecerán
                    cuando conectemos este módulo con la base de datos.
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {operacion && (
        <div className="stock-modal-fondo">
          <section className="stock-modal">
            <header>
              <div>
                <h2>
                  {operacion === "entrada"
                    ? "Registrar entrada"
                    : operacion === "salida"
                      ? "Registrar salida"
                      : "Ajustar stock"}
                </h2>
                <p>
                  Formulario de diseño. La operación se conectará
                  al backend en la etapa de integración.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setOperacion("")}
                aria-label="Cerrar"
              >
                ×
              </button>
            </header>

            <div className="stock-formulario">
              <label>Producto</label>
              <select defaultValue="">
                <option value="" disabled>
                  Seleccioná un producto
                </option>
              </select>

              <label>Cantidad</label>
              <input type="number" min="1" placeholder="Ingresá la cantidad" />

              <label>Motivo / Observación</label>
              <textarea
                rows={3}
                placeholder="Detalle de la operación..."
              />
            </div>

            <footer>
              <button
                className="stock-cancelar"
                onClick={() => setOperacion("")}
              >
                Cerrar
              </button>

              <button
                className="stock-guardar"
                onClick={() => setOperacion("")}
              >
                Próximamente
              </button>
            </footer>
          </section>
        </div>
      )}
    </main>
  );
}
