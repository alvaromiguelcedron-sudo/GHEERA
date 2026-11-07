
import express from "express";
import mongoose from "mongoose";

import Compra from "../models/Compra.js";
import Producto from "../models/Producto.js";
import Proveedor from "../models/Proveedor.js";
import Caja from "../models/Caja.js";
import MovimientoCaja from "../models/MovimientoCaja.js";

const router = express.Router();

// REGISTRAR UNA COMPRA
router.post("/", async (req, res) => {
  try {
    const { proveedor, productos, observacion } = req.body;

    if (
      !proveedor ||
      !mongoose.isValidObjectId(proveedor) ||
      !Array.isArray(productos) ||
      productos.length === 0
    ) {
      return res.status(400).json({
        mensaje: "Debés indicar un proveedor válido y al menos un producto"
      });
    }

    const proveedorExiste = await Proveedor.findById(proveedor);

    if (!proveedorExiste || !proveedorExiste.activo) {
      return res.status(404).json({
        mensaje: "Proveedor no encontrado o inactivo"
      });
    }

    const detallesCompra = [];
    let total = 0;

    for (const item of productos) {
      if (!mongoose.isValidObjectId(item.producto)) {
        return res.status(400).json({
          mensaje: "El ID de un producto no es válido"
        });
      }

      const producto = await Producto.findById(item.producto);

      if (!producto) {
        return res.status(404).json({
          mensaje: `No se encontró el producto ${item.producto}`
        });
      }

      const cantidad = Number(item.cantidad);

      if (!Number.isInteger(cantidad) || cantidad <= 0) {
        return res.status(400).json({
          mensaje: "La cantidad debe ser un número entero mayor a cero"
        });
      }

      const precioCompra = Number(item.precioCompra);

      if (!Number.isFinite(precioCompra) || precioCompra < 0) {
        return res.status(400).json({
          mensaje: "El precio de compra no es válido"
        });
      }

      const subtotal = cantidad * precioCompra;

      detallesCompra.push({
        producto: producto._id,
        nombreProducto: producto.nombre,
        cantidad,
        precioCompra,
        subtotal
      });

      total += subtotal;
    }

    total = Number(total.toFixed(2));

    // Registrar la compra como pendiente de pago
    const nuevaCompra = await Compra.create({
      proveedor,
      productos: detallesCompra,
      total,
      montoPagado: 0,
      saldoPendiente: total,
      estadoPago: "pendiente",
      pagos: [],
      observacion
    });

    // Actualizar el stock y el precio de compra
    for (const item of detallesCompra) {
      await Producto.findByIdAndUpdate(item.producto, {
        $inc: { stock: item.cantidad },
        $set: { precioCompra: item.precioCompra }
      });
    }

    res.status(201).json({
      mensaje: "Compra registrada correctamente. Quedó pendiente de pago.",
      compra: nuevaCompra,
      total
    });

  } catch (error) {
    res.status(500).json({
      mensaje: "Error al registrar la compra",
      error: error.message
    });
  }
});

// LISTAR TODAS LAS COMPRAS
router.get("/", async (req, res) => {
  try {
    const compras = await Compra.find()
      .populate("proveedor")
      .populate("productos.producto")
      .sort({ createdAt: -1 });

    res.json(compras);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener las compras",
      error: error.message
    });
  }
});

// BUSCAR UNA COMPRA POR ID
router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        mensaje: "ID de compra inválido"
      });
    }

    const compra = await Compra.findById(req.params.id)
      .populate("proveedor")
      .populate("productos.producto");

    if (!compra) {
      return res.status(404).json({
        mensaje: "Compra no encontrada"
      });
    }

    res.json(compra);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al buscar la compra",
      error: error.message
    });
  }
});

// REGISTRAR UN PAGO PARCIAL O TOTAL A UN PROVEEDOR
router.post("/:id/pagos", async (req, res) => {
  let compra = null;
  let movimientoCaja = null;
  let cajaId = null;
  let cajaActualizada = false;
  let montoRegistrado = 0;
  let compraGuardada = false;

  let estadoAnterior = null;

  try {
    const { id } = req.params;
    const monto = req.body.monto;
    const observacion = req.body.observacion || "";

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        mensaje: "ID de compra inválido"
      });
    }

    if (
      typeof monto !== "number" ||
      !Number.isFinite(monto) ||
      monto <= 0
    ) {
      return res.status(400).json({
        mensaje: "El monto del pago debe ser un número positivo"
      });
    }

    compra = await Compra.findById(id);

    if (!compra) {
      return res.status(404).json({
        mensaje: "Compra no encontrada"
      });
    }

    const montoPagadoAnterior = Number(compra.montoPagado || 0);
    const saldoAnterior = Number(
      (compra.saldoPendiente ?? compra.total - montoPagadoAnterior).toFixed(2)
    );

    if (saldoAnterior <= 0) {
      return res.status(400).json({
        mensaje: "Esta compra ya está completamente pagada"
      });
    }

    if (monto > saldoAnterior + 0.001) {
      return res.status(400).json({
        mensaje: "El pago supera el saldo pendiente",
        saldoPendiente: saldoAnterior
      });
    }

    // Verificar que haya una caja abierta
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

    // Guardar los valores anteriores para poder revertirlos
    estadoAnterior = {
      montoPagado: compra.montoPagado,
      saldoPendiente: compra.saldoPendiente,
      estadoPago: compra.estadoPago,
      pagos: compra.pagos.map((pago) => ({
        monto: pago.monto,
        fechaPago: pago.fechaPago,
        observacion: pago.observacion
      }))
    };

    // Actualizar la compra
    compra.montoPagado = Number(
      (montoPagadoAnterior + monto).toFixed(2)
    );

    compra.saldoPendiente = Number(
      (saldoAnterior - monto).toFixed(2)
    );

    if (compra.saldoPendiente <= 0.001) {
      compra.saldoPendiente = 0;
      compra.estadoPago = "pagada";
    } else if (compra.montoPagado > 0) {
      compra.estadoPago = "parcial";
    }

    compra.pagos.push({
      monto,
      fechaPago: new Date(),
      observacion
    });

    await compra.save();
    compraGuardada = true;

    // Crear el egreso en Caja
    movimientoCaja = new MovimientoCaja({
      caja: cajaId,
      tipo: "egreso",
      categoria: "compra_proveedor",
      monto,
      descripcion: `Pago a proveedor - Compra ${compra._id}`,
      referencia: compra._id,
      referenciaModelo: "Compra"
    });

    await movimientoCaja.save();

    // Descontar el pago del saldo esperado de Caja
    const resultadoCaja = await Caja.updateOne(
      {
        _id: cajaId,
        estado: "abierta",
        saldoEsperado: { $gte: monto }
      },
      {
        $inc: {
          totalEgresos: monto,
          saldoEsperado: -monto
        }
      }
    );

    if (resultadoCaja.modifiedCount !== 1) {
      throw new Error(
        "No se pudo actualizar Caja. Verificá que siga abierta y tenga saldo suficiente."
      );
    }

    cajaActualizada = true;

    res.json({
      mensaje: "Pago al proveedor registrado correctamente",
      compra,
      movimientoCaja,
      saldoEsperadoCaja: Number(
        (cajaAbierta.saldoEsperado - monto).toFixed(2)
      )
    });

  } catch (error) {
    // Revertir los totales de Caja
    if (cajaActualizada && cajaId) {
      await Caja.updateOne(
        { _id: cajaId },
        {
          $inc: {
            totalEgresos: -montoRegistrado,
            saldoEsperado: montoRegistrado
          }
        }
      );
    }

    // Eliminar el movimiento de Caja
    if (movimientoCaja) {
      await MovimientoCaja.findByIdAndDelete(
        movimientoCaja._id
      );
    }

    // Restaurar los datos anteriores de la compra
    if (compraGuardada && compra && estadoAnterior) {
      compra.montoPagado = estadoAnterior.montoPagado;
      compra.saldoPendiente = estadoAnterior.saldoPendiente;
      compra.estadoPago = estadoAnterior.estadoPago;
      compra.pagos = estadoAnterior.pagos;

      await compra.save();
    }

    res.status(500).json({
      mensaje: "Error al registrar el pago al proveedor",
      error: error.message
    });
  }
});

export default router;
