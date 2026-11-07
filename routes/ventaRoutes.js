
import express from "express";
import mongoose from "mongoose";

import Venta from "../models/Venta.js";
import Producto from "../models/Producto.js";
import Movimiento from "../models/Movimiento.js";
import Cliente from "../models/Cliente.js";
import CuentaCorriente from "../models/CuentaCorriente.js";
import Caja from "../models/Caja.js";
import MovimientoCaja from "../models/MovimientoCaja.js";

const router = express.Router();

// GET: consultar todas las ventas
router.get("/", async (req, res) => {
  try {
    const ventas = await Venta.find()
      .populate("cliente")
      .populate("cuentaCorriente")
      .sort({ fecha: -1 });

    res.status(200).json(ventas);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al consultar las ventas",
      error: error.message
    });
  }
});

// GET: consultar una venta por ID
router.get("/:id", async (req, res) => {
  try {
    const venta = await Venta.findById(req.params.id)
      .populate("cliente")
      .populate("cuentaCorriente");

    if (!venta) {
      return res.status(404).json({
        mensaje: "Venta no encontrada"
      });
    }

    res.status(200).json(venta);
  } catch (error) {
    res.status(400).json({
      mensaje: "ID de venta inválido",
      error: error.message
    });
  }
});

// POST: registrar una venta de contado o crédito
router.post("/", async (req, res) => {
  const productosActualizados = [];
  const movimientosGuardados = [];

  let ventaGuardada = null;
  let cuentaGuardada = null;
  let cajaAbierta = null;
  let movimientoCajaGuardado = null;
  let cajaActualizada = false;
  let importeCaja = 0;

  try {
    const {
      productos,
      observacion,
      tipoVenta = "contado",
      cliente,
      periodicidad,
      tasaInteres = 0,
      fechaInicio,
      proximoVencimiento
    } = req.body;

    // Validar tipo de venta
    if (!["contado", "credito"].includes(tipoVenta)) {
      return res.status(400).json({
        mensaje: "El tipo de venta debe ser contado o credito"
      });
    }

    // Validar productos
    if (!Array.isArray(productos) || productos.length === 0) {
      return res.status(400).json({
        mensaje: "La venta debe contener al menos un producto"
      });
    }

    // Verificar caja abierta para ventas de contado
    if (tipoVenta === "contado") {
      cajaAbierta = await Caja.findOne({ estado: "abierta" });

      if (!cajaAbierta) {
        return res.status(409).json({
          mensaje: "No se puede registrar una venta de contado porque no hay una caja abierta"
        });
      }
    }

    // Validar datos del crédito
    let clienteEncontrado = null;

    if (tipoVenta === "credito") {
      if (!cliente || !mongoose.isValidObjectId(cliente)) {
        return res.status(400).json({
          mensaje: "Para una venta a crédito debés indicar un cliente válido"
        });
      }

      if (!["semanal", "quincenal", "mensual"].includes(periodicidad)) {
        return res.status(400).json({
          mensaje: "La periodicidad debe ser semanal, quincenal o mensual"
        });
      }

      if (!proximoVencimiento || isNaN(new Date(proximoVencimiento).getTime())) {
        return res.status(400).json({
          mensaje: "Debés indicar una fecha de próximo vencimiento válida"
        });
      }

      if (
        typeof tasaInteres !== "number" ||
        !Number.isFinite(tasaInteres) ||
        tasaInteres < 0
      ) {
        return res.status(400).json({
          mensaje: "La tasa de interés debe ser un número igual o mayor a cero"
        });
      }

      clienteEncontrado = await Cliente.findById(cliente);

      if (!clienteEncontrado || clienteEncontrado.activo === false) {
        return res.status(404).json({
          mensaje: "El cliente no existe o está inactivo"
        });
      }
    } else if (cliente && !mongoose.isValidObjectId(cliente)) {
      return res.status(400).json({
        mensaje: "El ID del cliente no es válido"
      });
    }

    // Agrupar productos repetidos
    const cantidades = new Map();

    for (const item of productos) {
      if (
        !item.producto ||
        !mongoose.isValidObjectId(item.producto) ||
        !Number.isInteger(item.cantidad) ||
        item.cantidad < 1
      ) {
        return res.status(400).json({
          mensaje: "Verificá los productos y sus cantidades"
        });
      }

      const id = item.producto.toString();

      cantidades.set(
        id,
        (cantidades.get(id) || 0) + item.cantidad
      );
    }

    const detalles = [];

    let total = 0;
    let gananciaTotal = 0;

    // Verificar stock y calcular importes
    for (const [id, cantidad] of cantidades) {
      const producto = await Producto.findOneAndUpdate(
        {
          _id: id,
          stock: { $gte: cantidad }
        },
        {
          $inc: { stock: -cantidad }
        },
        {
          new: true
        }
      );

      if (!producto) {
        const existe = await Producto.exists({ _id: id });

        if (!existe) {
          throw new Error(`El producto ${id} no existe`);
        }

        throw new Error(
          `Stock insuficiente para el producto ${id}`
        );
      }

      productosActualizados.push({
        id,
        cantidad
      });

      const subtotal = producto.precio * cantidad;

      const ganancia =
        (producto.precio - producto.precioCompra) * cantidad;

      total += subtotal;
      gananciaTotal += ganancia;

      detalles.push({
        producto: producto._id,
        nombreProducto: producto.nombre,
        cantidad,
        precioCompra: producto.precioCompra,
        precioVenta: producto.precio,
        subtotal,
        ganancia
      });
    }

    // Crear cuenta corriente si la venta es a crédito
    if (tipoVenta === "credito") {
      cuentaGuardada = new CuentaCorriente({
        cliente: clienteEncontrado._id,
        montoInicial: total,
        saldoPendiente: total,
        tasaInteres,
        periodicidad,
        fechaInicio: fechaInicio || new Date(),
        proximoVencimiento: new Date(proximoVencimiento),
        estado: "pendiente",
        observaciones: observacion || ""
      });

      await cuentaGuardada.save();
    }

    // Crear la venta
    ventaGuardada = new Venta({
      productos: detalles,
      total,
      gananciaTotal,
      observacion,
      tipoVenta,
      cliente: cliente || null,
      estadoPago: tipoVenta === "credito" ? "pendiente" : "pagada",
      cuentaCorriente: cuentaGuardada
        ? cuentaGuardada._id
        : null
    });

    await ventaGuardada.save();

    // Registrar cada salida en el historial de stock
    for (const detalle of detalles) {
      const movimiento = new Movimiento({
        producto: detalle.producto,
        tipo: "salida",
        cantidad: detalle.cantidad,
        motivo: "Venta",
        observacion: `Venta ${ventaGuardada._id}`
      });

      await movimiento.save();

      movimientosGuardados.push(movimiento._id);
    }

    // Registrar ingreso automático en Caja para ventas de contado
    if (tipoVenta === "contado") {
      importeCaja = total;

      movimientoCajaGuardado = new MovimientoCaja({
        caja: cajaAbierta._id,
        tipo: "ingreso",
        categoria: "venta_contado",
        monto: total,
        descripcion: `Venta de contado ${ventaGuardada._id}`,
        referencia: ventaGuardada._id,
        referenciaModelo: "Venta"
      });

      await movimientoCajaGuardado.save();

      const resultadoCaja = await Caja.updateOne(
        {
          _id: cajaAbierta._id,
          estado: "abierta"
        },
        {
          $inc: {
            totalIngresos: total,
            saldoEsperado: total
          }
        }
      );

      if (resultadoCaja.modifiedCount !== 1) {
        throw new Error("No se pudo actualizar la caja abierta");
      }

      cajaActualizada = true;
    }

    res.status(201).json({
      mensaje: tipoVenta === "credito"
        ? "Venta a crédito registrada correctamente"
        : "Venta de contado registrada correctamente",
      venta: ventaGuardada,
      cuentaCorriente: cuentaGuardada,
      movimientoCaja: movimientoCajaGuardado,
      stockActualizado: true
    });

  } catch (error) {
    // Revertir el ingreso de Caja si se había actualizado
    if (cajaActualizada && cajaAbierta) {
      await Caja.updateOne(
        { _id: cajaAbierta._id },
        {
          $inc: {
            totalIngresos: -importeCaja,
            saldoEsperado: -importeCaja
          }
        }
      );
    }

    // Eliminar movimiento de Caja si se había guardado
    if (movimientoCajaGuardado) {
      await MovimientoCaja.findByIdAndDelete(
        movimientoCajaGuardado._id
      );
    }

    // Eliminar movimientos de stock registrados
    if (movimientosGuardados.length > 0) {
      await Movimiento.deleteMany({
        _id: { $in: movimientosGuardados }
      });
    }

    // Eliminar venta si se alcanzó a guardar
    if (ventaGuardada) {
      await Venta.findByIdAndDelete(ventaGuardada._id);
    }

    // Eliminar cuenta corriente si se alcanzó a crear
    if (cuentaGuardada) {
      await CuentaCorriente.findByIdAndDelete(cuentaGuardada._id);
    }

    // Devolver las unidades al stock
    for (const item of productosActualizados) {
      await Producto.findByIdAndUpdate(item.id, {
        $inc: { stock: item.cantidad }
      });
    }

    res.status(400).json({
      mensaje: "No se pudo registrar la venta",
      error: error.message
    });
  }
});

export default router;
