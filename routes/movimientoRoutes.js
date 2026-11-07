
import express from "express";
import mongoose from "mongoose";
import Movimiento from "../models/Movimiento.js";
import Producto from "../models/Producto.js";

const router = express.Router();

// GET: consultar todos los movimientos
router.get("/", async (req, res) => {
  try {
    const movimientos = await Movimiento.find()
      .populate("producto");

    res.status(200).json(movimientos);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al consultar movimientos",
      error: error.message
    });
  }
});

// POST: registrar una entrada o salida
router.post("/", async (req, res) => {
  try {
    const { producto, tipo, cantidad, motivo, observacion } = req.body;

    if (!mongoose.isValidObjectId(producto)) {
      return res.status(400).json({
        mensaje: "El ID del producto no es válido"
      });
    }

    if (!["entrada", "salida"].includes(tipo)) {
      return res.status(400).json({
        mensaje: "El tipo debe ser entrada o salida"
      });
    }

    if (!Number.isInteger(cantidad) || cantidad < 1) {
      return res.status(400).json({
        mensaje: "La cantidad debe ser un número entero mayor a cero"
      });
    }

    const productoExiste = await Producto.findById(producto);

    if (!productoExiste) {
      return res.status(404).json({
        mensaje: "Producto no encontrado"
      });
    }

    let productoActualizado;

    if (tipo === "entrada") {
      productoActualizado = await Producto.findByIdAndUpdate(
        producto,
        { $inc: { stock: cantidad } },
        { new: true }
      );
    } else {
      productoActualizado = await Producto.findOneAndUpdate(
        {
          _id: producto,
          stock: { $gte: cantidad }
        },
        { $inc: { stock: -cantidad } },
        { new: true }
      );

      if (!productoActualizado) {
        return res.status(400).json({
          mensaje: "Stock insuficiente para realizar la salida"
        });
      }
    }

    try {
      const movimiento = new Movimiento({
        producto,
        tipo,
        cantidad,
        motivo,
        observacion
      });

      await movimiento.save();

      res.status(201).json({
        mensaje: "Movimiento registrado correctamente",
        movimiento,
        stockActual: productoActualizado.stock
      });
    } catch (error) {
      // Revertir el stock si no se pudo guardar el movimiento
      const ajuste = tipo === "entrada" ? -cantidad : cantidad;

      await Producto.findByIdAndUpdate(producto, {
        $inc: { stock: ajuste }
      });

      throw error;
    }
  } catch (error) {
    res.status(400).json({
      mensaje: "Error al registrar el movimiento",
      error: error.message
    });
  }
});

export default router;
