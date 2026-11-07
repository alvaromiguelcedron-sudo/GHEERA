
import express from "express";
import mongoose from "mongoose";

import Caja from "../models/Caja.js";
import MovimientoCaja from "../models/MovimientoCaja.js";

const router = express.Router();

// ABRIR CAJA
router.post("/abrir", async (req, res) => {
  try {
    const { montoInicial, observaciones } = req.body;

    if (
      typeof montoInicial !== "number" ||
      !Number.isFinite(montoInicial) ||
      montoInicial < 0
    ) {
      return res.status(400).json({
        mensaje: "El monto inicial debe ser un número igual o mayor a cero",
      });
    }

    const cajaAbierta = await Caja.findOne({
      estado: "abierta",
    });

    if (cajaAbierta) {
      return res.status(409).json({
        mensaje: "Ya existe una caja abierta",
        caja: cajaAbierta,
      });
    }

    const caja = new Caja({
      montoInicial,
      saldoEsperado: montoInicial,
      observaciones: observaciones || "",
    });

    await caja.save();

    res.status(201).json({
      mensaje: "Caja abierta correctamente",
      caja,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        mensaje: "Ya existe una caja abierta",
      });
    }

    res.status(500).json({
      mensaje: "Error al abrir la caja",
      error: error.message,
    });
  }
});

// CONSULTAR CAJA ABIERTA
router.get("/abierta", async (req, res) => {
  try {
    const caja = await Caja.findOne({
      estado: "abierta",
    });

    if (!caja) {
      return res.status(404).json({
        mensaje: "No hay ninguna caja abierta",
      });
    }

    res.json(caja);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al consultar la caja",
      error: error.message,
    });
  }
});

// REGISTRAR INGRESO O EGRESO MANUAL
router.post("/:id/movimientos", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      tipo,
      categoria,
      monto,
      descripcion,
    } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        mensaje: "ID de caja inválido",
      });
    }

    if (!["ingreso", "egreso"].includes(tipo)) {
      return res.status(400).json({
        mensaje: "El tipo debe ser ingreso o egreso",
      });
    }

    const categoriasIngreso = [
      "venta_contado",
      "cobro_cuota",
      "otro_ingreso",
    ];

    const categoriasEgreso = [
      "compra_proveedor",
      "gasto",
      "retiro",
      "otro_egreso",
    ];

    if (
      (tipo === "ingreso" && !categoriasIngreso.includes(categoria)) ||
      (tipo === "egreso" && !categoriasEgreso.includes(categoria))
    ) {
      return res.status(400).json({
        mensaje: "La categoría no corresponde al tipo de movimiento",
      });
    }

    if (
      typeof monto !== "number" ||
      !Number.isFinite(monto) ||
      monto <= 0
    ) {
      return res.status(400).json({
        mensaje: "El monto debe ser un número positivo",
      });
    }

    const caja = await Caja.findById(id);

    if (!caja) {
      return res.status(404).json({
        mensaje: "Caja no encontrada",
      });
    }

    if (caja.estado !== "abierta") {
      return res.status(400).json({
        mensaje: "No se pueden registrar movimientos en una caja cerrada",
      });
    }

    if (tipo === "egreso" && monto > caja.saldoEsperado) {
      return res.status(400).json({
        mensaje: "El egreso supera el dinero disponible en caja",
        saldoDisponible: caja.saldoEsperado,
      });
    }

    const movimiento = new MovimientoCaja({
      caja: caja._id,
      tipo,
      categoria,
      monto,
      descripcion: descripcion || "",
    });

    await movimiento.save();

    if (tipo === "ingreso") {
      caja.totalIngresos += monto;
    } else {
      caja.totalEgresos += monto;
    }

    caja.saldoEsperado = Number(
      (
        caja.montoInicial +
        caja.totalIngresos -
        caja.totalEgresos
      ).toFixed(2)
    );

    await caja.save();

    res.status(201).json({
      mensaje: "Movimiento de caja registrado correctamente",
      movimiento,
      saldoEsperado: caja.saldoEsperado,
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al registrar el movimiento",
      error: error.message,
    });
  }
});

// CONSULTAR MOVIMIENTOS DE UNA CAJA
router.get("/:id/movimientos", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        mensaje: "ID de caja inválido",
      });
    }

    const caja = await Caja.findById(id);

    if (!caja) {
      return res.status(404).json({
        mensaje: "Caja no encontrada",
      });
    }

    const movimientos = await MovimientoCaja.find({
      caja: id,
    }).sort({ fecha: -1 });

    res.json({
      caja: caja._id,
      saldoEsperado: caja.saldoEsperado,
      movimientos,
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al consultar los movimientos",
      error: error.message,
    });
  }
});

// CERRAR CAJA
router.post("/:id/cerrar", async (req, res) => {
  try {
    const { id } = req.params;
    const { montoContado } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        mensaje: "ID de caja inválido",
      });
    }

    if (
      typeof montoContado !== "number" ||
      !Number.isFinite(montoContado) ||
      montoContado < 0
    ) {
      return res.status(400).json({
        mensaje: "El monto contado debe ser un número igual o mayor a cero",
      });
    }

    const caja = await Caja.findById(id);

    if (!caja) {
      return res.status(404).json({
        mensaje: "Caja no encontrada",
      });
    }

    if (caja.estado !== "abierta") {
      return res.status(400).json({
        mensaje: "Esta caja ya está cerrada",
      });
    }

    caja.montoContado = montoContado;

    caja.diferencia = Number(
      (montoContado - caja.saldoEsperado).toFixed(2)
    );

    caja.estado = "cerrada";
    caja.fechaCierre = new Date();

    await caja.save();

    res.json({
      mensaje: "Caja cerrada correctamente",
      resumen: caja,
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al cerrar la caja",
      error: error.message,
    });
  }
});

// CONSULTAR HISTORIAL DE CAJAS
router.get("/historial", async (req, res) => {
  try {
    const cajas = await Caja.find({
      estado: "cerrada",
    }).sort({ fechaCierre: -1 });

    res.json(cajas);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al consultar el historial de cajas",
      error: error.message,
    });
  }
});

export default router;
