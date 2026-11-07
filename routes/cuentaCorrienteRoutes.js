
import express from "express";
import CuentaCorriente from "../models/CuentaCorriente.js";
import Cliente from "../models/Cliente.js";

const router = express.Router();

// REGISTRAR UNA CUENTA CORRIENTE
router.post("/", async (req, res) => {
  try {
    const {
      cliente,
      montoInicial,
      tasaInteres,
      periodicidad,
      proximoVencimiento,
      observaciones,
    } = req.body;

    if (
      !cliente ||
      montoInicial === undefined ||
      !periodicidad ||
      !proximoVencimiento
    ) {
      return res.status(400).json({
        mensaje: "Faltan datos obligatorios",
      });
    }

    if (!["semanal", "quincenal", "mensual"].includes(periodicidad)) {
      return res.status(400).json({
        mensaje: "Periodicidad no válida",
      });
    }

    if (!Number.isFinite(montoInicial) || montoInicial <= 0) {
      return res.status(400).json({
        mensaje: "El monto inicial debe ser mayor a cero",
      });
    }

    const interes = tasaInteres ?? 0;

    if (!Number.isFinite(interes) || interes < 0) {
      return res.status(400).json({
        mensaje: "La tasa de interés no es válida",
      });
    }

    const fechaVencimiento = new Date(proximoVencimiento);

    if (Number.isNaN(fechaVencimiento.getTime())) {
      return res.status(400).json({
        mensaje: "La fecha de vencimiento no es válida",
      });
    }

    const clienteExiste = await Cliente.findById(cliente);

    if (!clienteExiste || !clienteExiste.activo) {
      return res.status(404).json({
        mensaje: "Cliente no encontrado o inactivo",
      });
    }

    const cuenta = new CuentaCorriente({
      cliente,
      montoInicial,
      saldoPendiente: montoInicial,
      tasaInteres: interes,
      periodicidad,
      proximoVencimiento: fechaVencimiento,
      observaciones,
    });

    await cuenta.save();

    res.status(201).json({
      mensaje: "Cuenta corriente registrada correctamente",
      cuenta,
    });
  } catch (error) {
    res.status(400).json({
      mensaje: "Error al registrar la cuenta corriente",
      error: error.message,
    });
  }
});

// LISTAR TODAS LAS CUENTAS
router.get("/", async (req, res) => {
  try {
    const cuentas = await CuentaCorriente.find()
      .populate("cliente")
      .sort({ createdAt: -1 });

    res.json(cuentas);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener las cuentas",
      error: error.message,
    });
  }
});

// BUSCAR CUENTA POR ID
router.get("/:id", async (req, res) => {
  try {
    const cuenta = await CuentaCorriente.findById(req.params.id)
      .populate("cliente");

    if (!cuenta) {
      return res.status(404).json({
        mensaje: "Cuenta corriente no encontrada",
      });
    }

    res.json(cuenta);
  } catch (error) {
    res.status(400).json({
      mensaje: "Error al buscar la cuenta",
      error: error.message,
    });
  }
});

// REGISTRAR UN PAGO
router.post("/:id/pagos", async (req, res) => {
  try {
    const { monto, observacion } = req.body;

    if (!Number.isFinite(monto) || monto <= 0) {
      return res.status(400).json({
        mensaje: "El monto del pago debe ser mayor a cero",
      });
    }

    const cuenta = await CuentaCorriente.findById(req.params.id);

    if (!cuenta) {
      return res.status(404).json({
        mensaje: "Cuenta corriente no encontrada",
      });
    }

    if (cuenta.estado === "pagado") {
      return res.status(400).json({
        mensaje: "Esta cuenta ya está pagada",
      });
    }

    if (monto > cuenta.saldoPendiente) {
      return res.status(400).json({
        mensaje: "El pago supera el saldo pendiente",
      });
    }

    cuenta.pagos.push({
      monto,
      observacion: observacion || "",
    });

    cuenta.saldoPendiente = Math.max(
      0,
      cuenta.saldoPendiente - monto
    );

    if (cuenta.saldoPendiente === 0) {
      cuenta.estado = "pagado";
    }

    await cuenta.save();

    res.json({
      mensaje: "Pago registrado correctamente",
      cuenta,
    });
  } catch (error) {
    res.status(400).json({
      mensaje: "Error al registrar el pago",
      error: error.message,
    });
  }
});

export default router;
