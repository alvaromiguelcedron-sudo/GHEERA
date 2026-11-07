
import express from "express";
import mongoose from "mongoose";

import Cuota from "../models/Cuota.js";
import CuentaCorriente from "../models/CuentaCorriente.js";
import Venta from "../models/Venta.js";
import Caja from "../models/Caja.js";
import MovimientoCaja from "../models/MovimientoCaja.js";

const router = express.Router();

// CALCULAR RECARGO DESDE LA FECHA DE VENCIMIENTO
const calcularRecargo = (capital, fechaVencimiento, porcentajeDiario) => {
  const hoy = new Date();
  const vencimiento = new Date(fechaVencimiento);

  hoy.setHours(0, 0, 0, 0);
  vencimiento.setHours(0, 0, 0, 0);

  const diasAtraso = Math.max(
    0,
    Math.floor((hoy - vencimiento) / (1000 * 60 * 60 * 24))
  );

  const recargo = Number(
    (capital * (porcentajeDiario / 100) * diasAtraso).toFixed(2)
  );

  return { diasAtraso, recargo };
};

// SINCRONIZAR SALDO Y ESTADO DE LA CUENTA CORRIENTE
const sincronizarCuenta = async (cuentaId) => {
  const cuenta = await CuentaCorriente.findById(cuentaId);

  if (!cuenta) {
    throw new Error("No se encontró la cuenta corriente");
  }

  const cuotas = await Cuota.find({
    cuentaCorriente: cuentaId
  });

  const cuotasPendientes = cuotas.filter(
    (cuota) => cuota.estado !== "pagada"
  );

  const saldoTotal = cuotas.reduce(
    (total, cuota) => total + cuota.saldoPendiente,
    0
  );

  cuenta.saldoPendiente = Number(saldoTotal.toFixed(2));

  if (cuotasPendientes.length === 0) {
    cuenta.saldoPendiente = 0;
    cuenta.estado = "pagado";
  } else {
    const hayVencidas = cuotasPendientes.some(
      (cuota) => cuota.estado === "vencida"
    );

    cuenta.estado = hayVencidas ? "vencido" : "pendiente";

    const proximaCuota = [...cuotasPendientes].sort(
      (a, b) =>
        new Date(a.fechaVencimiento) - new Date(b.fechaVencimiento)
    )[0];

    cuenta.proximoVencimiento = proximaCuota.fechaVencimiento;
  }

  await cuenta.save();

  return cuenta;
};

// SINCRONIZAR ESTADO DE LA VENTA
const sincronizarVenta = async (cuenta) => {
  const venta = await Venta.findOne({
    cuentaCorriente: cuenta._id
  });

  if (!venta) {
    return null;
  }

  if (cuenta.saldoPendiente === 0) {
    venta.estadoPago = "pagada";
  } else if (cuenta.saldoPendiente < cuenta.montoInicial) {
    venta.estadoPago = "parcial";
  } else {
    venta.estadoPago = "pendiente";
  }

  await venta.save();

  return venta;
};

// CREAR CUOTAS PARA UNA CUENTA CORRIENTE
router.post("/generar/:cuentaId", async (req, res) => {
  try {
    const { cuentaId } = req.params;
    const { cuotas } = req.body;

    if (!mongoose.Types.ObjectId.isValid(cuentaId)) {
      return res.status(400).json({
        mensaje: "ID de cuenta corriente inválido"
      });
    }

    if (!Array.isArray(cuotas) || cuotas.length === 0) {
      return res.status(400).json({
        mensaje: "Debés enviar una lista de cuotas"
      });
    }

    const cuenta = await CuentaCorriente.findById(cuentaId);

    if (!cuenta) {
      return res.status(404).json({
        mensaje: "Cuenta corriente no encontrada"
      });
    }

    const cuotasExistentes = await Cuota.countDocuments({
      cuentaCorriente: cuentaId
    });

    if (cuotasExistentes > 0) {
      return res.status(409).json({
        mensaje: "Esta cuenta ya tiene cuotas generadas"
      });
    }

    const capitalesValidos = cuotas.every(
      (cuota) =>
        Number.isFinite(cuota.capital) &&
        cuota.capital > 0 &&
        typeof cuota.fechaVencimiento === "string" &&
        Number.isFinite(new Date(cuota.fechaVencimiento).getTime()) &&
        new Date(cuota.fechaVencimiento) > new Date(cuenta.fechaInicio)
    );

    if (!capitalesValidos) {
      return res.status(400).json({
        mensaje: "Cada cuota necesita un capital positivo y una fecha posterior al inicio de la cuenta"
      });
    }

    const sumaCapitales = cuotas.reduce(
      (total, cuota) => total + cuota.capital,
      0
    );

    if (Math.abs(sumaCapitales - cuenta.saldoPendiente) > 0.01) {
      return res.status(400).json({
        mensaje: "La suma de los capitales debe coincidir con el saldo pendiente de la cuenta",
        saldoPendiente: cuenta.saldoPendiente,
        sumaCapitales
      });
    }

    const cuotasOrdenadas = [...cuotas].sort(
      (a, b) =>
        new Date(a.fechaVencimiento) - new Date(b.fechaVencimiento)
    );

    const nuevasCuotas = cuotasOrdenadas.map((cuota, index) => {
      const porcentajeDiario = cuota.porcentajeDiario ?? 0.5;

      if (
        !Number.isFinite(porcentajeDiario) ||
        porcentajeDiario < 0
      ) {
        throw new Error("El porcentaje diario debe ser un número válido");
      }

      return {
        cuentaCorriente: cuentaId,
        numeroCuota: index + 1,
        capital: cuota.capital,
        fechaVencimiento: new Date(cuota.fechaVencimiento),
        porcentajeDiario,
        diasAtraso: 0,
        recargo: 0,
        total: cuota.capital,
        saldoPendiente: cuota.capital
      };
    });

    const resultado = await Cuota.insertMany(nuevasCuotas);

    await sincronizarCuenta(cuentaId);

    res.status(201).json({
      mensaje: "Cuotas generadas correctamente",
      cuotas: resultado
    });
  } catch (error) {
    res.status(400).json({
      mensaje: "Error al generar las cuotas",
      error: error.message
    });
  }
});

// OBTENER TODAS LAS CUOTAS
router.get("/", async (req, res) => {
  try {
    const cuotas = await Cuota.find()
      .populate({
        path: "cuentaCorriente",
        populate: {
          path: "cliente",
          select: "nombre apellido telefono"
        }
      })
      .sort({ fechaVencimiento: 1 });

    res.json(cuotas);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener las cuotas",
      error: error.message
    });
  }
});

// OBTENER CUOTAS DE UNA CUENTA
router.get("/cuenta/:cuentaId", async (req, res) => {
  try {
    const { cuentaId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(cuentaId)) {
      return res.status(400).json({
        mensaje: "ID de cuenta corriente inválido"
      });
    }

    const cuotas = await Cuota.find({
      cuentaCorriente: cuentaId
    }).sort({ numeroCuota: 1 });

    res.json(cuotas);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener las cuotas",
      error: error.message
    });
  }
});

// ACTUALIZAR RECARGOS Y ESTADOS
router.post("/actualizar-recargos", async (req, res) => {
  try {
    const cuotas = await Cuota.find({
      estado: { $ne: "pagada" }
    });

    const cuentasAActualizar = new Set();

    for (const cuota of cuotas) {
      const { diasAtraso, recargo } = calcularRecargo(
        cuota.capital,
        cuota.fechaVencimiento,
        cuota.porcentajeDiario
      );

      const pagosRealizados = cuota.pagos.reduce(
        (total, pago) => total + pago.monto,
        0
      );

      const nuevoTotal = Number(
        (cuota.capital + recargo).toFixed(2)
      );

      cuota.diasAtraso = diasAtraso;
      cuota.recargo = recargo;
      cuota.total = nuevoTotal;

      cuota.saldoPendiente = Math.max(
        0,
        Number((nuevoTotal - pagosRealizados).toFixed(2))
      );

      cuota.estado =
        cuota.saldoPendiente === 0
          ? "pagada"
          : diasAtraso > 0
            ? "vencida"
            : "pendiente";

      await cuota.save();

      cuentasAActualizar.add(cuota.cuentaCorriente.toString());
    }

    for (const cuentaId of cuentasAActualizar) {
      const cuenta = await sincronizarCuenta(cuentaId);
      await sincronizarVenta(cuenta);
    }

    res.json({
      mensaje: "Recargos, cuentas corrientes y ventas actualizados correctamente",
      cantidad: cuotas.length
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al actualizar los recargos",
      error: error.message
    });
  }
});

// REGISTRAR UN PAGO PARCIAL O TOTAL E INGRESARLO EN CAJA
router.post("/:id/pagos", async (req, res) => {
  let movimientoCajaGuardado = null;
  let cajaActualizada = false;
  let cajaId = null;
  let montoRegistrado = 0;

  try {
    const { id } = req.params;
    const monto = req.body.monto;
    const observacion = req.body.observacion || "";

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        mensaje: "ID de cuota inválido"
      });
    }

    if (!Number.isFinite(monto) || monto <= 0) {
      return res.status(400).json({
        mensaje: "El monto del pago debe ser un número positivo"
      });
    }

    const cuota = await Cuota.findById(id);

    if (!cuota) {
      return res.status(404).json({
        mensaje: "Cuota no encontrada"
      });
    }

    if (cuota.estado === "pagada") {
      return res.status(400).json({
        mensaje: "Esta cuota ya está pagada"
      });
    }

    // Verificar que exista una caja abierta antes de registrar el pago
    const cajaAbierta = await Caja.findOne({
      estado: "abierta"
    });

    if (!cajaAbierta) {
      return res.status(409).json({
        mensaje: "No se puede registrar el pago porque no hay una caja abierta"
      });
    }

    cajaId = cajaAbierta._id;
    montoRegistrado = monto;

    // Buscar la cuenta antes de modificar la cuota
    const cuenta = await CuentaCorriente.findById(
      cuota.cuentaCorriente
    );

    if (!cuenta) {
      return res.status(404).json({
        mensaje: "No se encontró la cuenta corriente de esta cuota"
      });
    }

    // Guardar estado anterior para poder revertir si ocurre un error
    const cuotaAnterior = {
      diasAtraso: cuota.diasAtraso,
      recargo: cuota.recargo,
      total: cuota.total,
      saldoPendiente: cuota.saldoPendiente,
      estado: cuota.estado,
      pagos: cuota.pagos.map((pago) => ({
        monto: pago.monto,
        observacion: pago.observacion,
        fechaPago: pago.fechaPago
      }))
    };

    const cuentaAnterior = {
      saldoPendiente: cuenta.saldoPendiente,
      estado: cuenta.estado,
      proximoVencimiento: cuenta.proximoVencimiento,
      pagos: cuenta.pagos.map((pago) => ({
        monto: pago.monto,
        observacion: pago.observacion,
        fechaPago: pago.fechaPago
      }))
    };

    const { diasAtraso, recargo } = calcularRecargo(
      cuota.capital,
      cuota.fechaVencimiento,
      cuota.porcentajeDiario
    );

    const pagosAnteriores = cuota.pagos.reduce(
      (total, pago) => total + pago.monto,
      0
    );

    const totalActualizado = Number(
      (cuota.capital + recargo).toFixed(2)
    );

    const saldoActualizado = Number(
      (totalActualizado - pagosAnteriores).toFixed(2)
    );

    if (monto > saldoActualizado + 0.001) {
      return res.status(400).json({
        mensaje: "El pago supera el saldo pendiente",
        saldoPendiente: saldoActualizado
      });
    }

    cuota.diasAtraso = diasAtraso;
    cuota.recargo = recargo;
    cuota.total = totalActualizado;

    cuota.pagos.push({
      monto,
      observacion,
      fechaPago: new Date()
    });

    cuota.saldoPendiente = Number(
      (saldoActualizado - monto).toFixed(2)
    );

    if (cuota.saldoPendiente <= 0.001) {
      cuota.saldoPendiente = 0;
      cuota.estado = "pagada";
    } else {
      cuota.estado =
        diasAtraso > 0 ? "vencida" : "pendiente";
    }

    await cuota.save();

    cuenta.pagos.push({
      monto,
      observacion: `Pago de cuota ${cuota.numeroCuota}. ${observacion}`.trim(),
      fechaPago: new Date()
    });

    await cuenta.save();

    const cuentaActualizada = await sincronizarCuenta(
      cuota.cuentaCorriente
    );

    const ventaActualizada = await sincronizarVenta(cuentaActualizada);

    // Crear movimiento de ingreso en Caja
    movimientoCajaGuardado = new MovimientoCaja({
      caja: cajaId,
      tipo: "ingreso",
      categoria: "cobro_cuota",
      monto,
      descripcion: `Cobro de cuota ${cuota.numeroCuota} - Cuenta ${cuenta._id}`,
      referencia: cuota._id,
      referenciaModelo: "Cuota"
    });

    await movimientoCajaGuardado.save();

    // Actualizar los totales de la caja
    const resultadoCaja = await Caja.updateOne(
      {
        _id: cajaId,
        estado: "abierta"
      },
      {
        $inc: {
          totalIngresos: monto,
          saldoEsperado: monto
        }
      }
    );

    if (resultadoCaja.modifiedCount !== 1) {
      throw new Error("No se pudo actualizar la caja abierta");
    }

    cajaActualizada = true;

    res.json({
      mensaje: "Pago registrado correctamente. La cuota, cuenta corriente, venta y caja fueron actualizadas.",
      cuota,
      cuentaCorriente: {
        id: cuentaActualizada._id,
        saldoPendiente: cuentaActualizada.saldoPendiente,
        estado: cuentaActualizada.estado,
        proximoVencimiento: cuentaActualizada.proximoVencimiento
      },
      venta: ventaActualizada
        ? {
            id: ventaActualizada._id,
            estadoPago: ventaActualizada.estadoPago
          }
        : null,
      movimientoCaja: movimientoCajaGuardado,
      saldoEsperadoCaja: Number(
        (cajaAbierta.saldoEsperado + monto).toFixed(2)
      )
    });

  } catch (error) {
    // Revertir el movimiento de caja si se alcanzó a crear
    if (movimientoCajaGuardado) {
      await MovimientoCaja.findByIdAndDelete(
        movimientoCajaGuardado._id
      );
    }

    // Revertir los totales de Caja si se habían actualizado
    if (cajaActualizada && cajaId) {
      await Caja.updateOne(
        { _id: cajaId },
        {
          $inc: {
            totalIngresos: -montoRegistrado,
            saldoEsperado: -montoRegistrado
          }
        }
      );
    }

    res.status(500).json({
      mensaje: "Error al registrar el pago",
      error: error.message
    });
  }
});

export default router;
