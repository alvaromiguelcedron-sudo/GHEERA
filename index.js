
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cron from "node-cron";

import conectarDB from "./config/database.js";

import productoRoutes from "./routes/productoRoutes.js";
import movimientoRoutes from "./routes/movimientoRoutes.js";
import ventaRoutes from "./routes/ventaRoutes.js";
import proveedorRoutes from "./routes/proveedorRoutes.js";
import compraRoutes from "./routes/compraRoutes.js";
import reportesRoutes from "./routes/reportesRoutes.js";
import clienteRoutes from "./routes/clienteRoutes.js";
import cuentaCorrienteRoutes from "./routes/cuentaCorrienteRoutes.js";
import notificacionRoutes from "./routes/notificacionRoutes.js";
import cuotaRoutes from "./routes/cuotaRoutes.js";
import historialClienteRoutes from "./routes/historialClienteRoutes.js";
import cajaRoutes from "./routes/cajaRoutes.js";

import generarRecordatorios from "./services/recordatoriosService.js";
import actualizarRecargos from "./services/actualizarRecargosService.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// MIDDLEWARES
app.use(cors());
app.use(express.json());

// RUTA PRINCIPAL
app.get("/", (req, res) => {
  res.json({
    mensaje: "API del sistema de stock funcionando correctamente"
  });
});

// RUTAS DEL SISTEMA
app.use("/api/productos", productoRoutes);
app.use("/api/movimientos", movimientoRoutes);
app.use("/api/ventas", ventaRoutes);
app.use("/api/proveedores", proveedorRoutes);
app.use("/api/compras", compraRoutes);
app.use("/api/reportes", reportesRoutes);
app.use("/api/clientes", clienteRoutes);
app.use("/api/cuentas-corrientes", cuentaCorrienteRoutes);
app.use("/api/notificaciones", notificacionRoutes);
app.use("/api/cuotas", cuotaRoutes);
app.use("/api/historial-clientes", historialClienteRoutes);
app.use("/api/caja", cajaRoutes);

// INICIAR SERVIDOR
const iniciarServidor = async () => {
  try {
    await conectarDB();

    // PROCESOS AUTOMÁTICOS DIARIOS
    cron.schedule(
      "0 8 * * *",
      async () => {
        console.log("Revisando vencimientos y recargos...");

        try {
          await actualizarRecargos();
          await generarRecordatorios();

          console.log("Proceso diario completado correctamente.");
        } catch (error) {
          console.error("Error en el proceso diario:", error.message);
        }
      },
      {
        timezone: "America/Argentina/Tucuman"
      }
    );

    // EJECUTAR PROCESOS AL INICIAR
    await actualizarRecargos();
    await generarRecordatorios();

    app.listen(PORT, () => {
      console.log(`Servidor funcionando en http://localhost:${PORT}`);
      console.log("Recargos automáticos programados para las 08:00.");
      console.log("Recordatorios automáticos programados para las 08:00.");
      console.log("Módulo de Caja conectado correctamente.");
    });

  } catch (error) {
    console.error("Error al iniciar el servidor:", error.message);
  }
};

iniciarServidor();
