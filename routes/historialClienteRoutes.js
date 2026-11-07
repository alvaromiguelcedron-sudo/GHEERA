
import express from "express";
import mongoose from "mongoose";

import Cliente from "../models/Cliente.js";
import CuentaCorriente from "../models/CuentaCorriente.js";
import Cuota from "../models/Cuota.js";

const router = express.Router();

// CONSULTAR ESTADO FINANCIERO DE UN CLIENTE
router.get("/:clienteId", async (req, res) => {
  try {
    const { clienteId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(clienteId)) {
      return res.status(400).json({
        mensaje: "ID de cliente inválido",
      });
    }

    const cliente = await Cliente.findById(clienteId);

    if (!cliente) {
      return res.status(404).json({
        mensaje: "Cliente no encontrado",
      });
    }

    const cuentas = await CuentaCorriente.find({
      cliente: clienteId,
    });

    const cuotas = await Cuota.find({
      cuentaCorriente: {
        $in: cuentas.map((cuenta) => cuenta._id),
      },
    }).sort({ fechaVencimiento: 1 });

    // TOTAL DE COMPRAS A CRÉDITO
    const totalCompras = cuentas.reduce(
      (total, cuenta) => total + cuenta.montoInicial,
      0
    );

    // TOTAL PAGADO SEGÚN LOS PAGOS DE LAS CUENTAS
    const totalPagado = cuentas.reduce(
      (total, cuenta) => {
        const pagosCuenta = cuenta.pagos.reduce(
          (suma, pago) => suma + pago.monto,
          0
        );

        return total + pagosCuenta;
      },
      0
    );

    // SALDO PENDIENTE REAL DE TODAS LAS CUENTAS
    const saldoPendiente = cuentas.reduce(
      (total, cuenta) => total + cuenta.saldoPendiente,
      0
    );

    // TOTAL DE RECARGOS DE LAS CUOTAS
    const totalRecargos = cuotas.reduce(
      (total, cuota) => total + cuota.recargo,
      0
    );

    const cuotasPendientes = cuotas.filter(
      (cuota) => cuota.estado === "pendiente"
    ).length;

    const cuotasVencidas = cuotas.filter(
      (cuota) => cuota.estado === "vencida"
    ).length;

    const cuotasPagadas = cuotas.filter(
      (cuota) => cuota.estado === "pagada"
    ).length;

    res.json({
      cliente,
      resumen: {
        totalCompras: Number(totalCompras.toFixed(2)),
        totalPagado: Number(totalPagado.toFixed(2)),
        saldoPendiente: Number(saldoPendiente.toFixed(2)),
        totalRecargos: Number(totalRecargos.toFixed(2)),
        cantidadCuentas: cuentas.length,
        cuotasPendientes,
        cuotasVencidas,
        cuotasPagadas,
      },
      cuentas,
      cuotas,
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al consultar el historial financiero",
      error: error.message,
    });
  }
});

export default router;
