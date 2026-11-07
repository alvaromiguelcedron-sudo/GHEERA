
import express from "express";

import Producto from "../models/Producto.js";
import Venta from "../models/Venta.js";
import Compra from "../models/Compra.js";
import Movimiento from "../models/Movimiento.js";

const router = express.Router();

// RESUMEN GENERAL DEL NEGOCIO
router.get("/resumen", async (req, res) => {
  try {
    const [
      cantidadProductos,
      cantidadVentas,
      cantidadCompras,
      ventas,
      compras,
      productosBajoStock,
    ] = await Promise.all([
      Producto.countDocuments(),
      Venta.countDocuments(),
      Compra.countDocuments(),
      Venta.find(),
      Compra.find(),
      Producto.find({ stock: { $lte: 5 } }),
    ]);

    const totalVentas = ventas.reduce(
      (acumulador, venta) => acumulador + (venta.total || 0),
      0
    );

    const totalCompras = compras.reduce(
      (acumulador, compra) => acumulador + (compra.total || 0),
      0
    );

    const gananciaTotal = ventas.reduce(
      (acumulador, venta) =>
        acumulador + (venta.gananciaTotal || 0),
      0
    );

    res.json({
      mensaje: "Resumen del negocio",
      cantidadProductos,
      cantidadVentas,
      cantidadCompras,
      totalVentas,
      totalCompras,
      gananciaTotal,
      cantidadProductosBajoStock: productosBajoStock.length,
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al generar el resumen",
      error: error.message,
    });
  }
});

// PRODUCTOS CON STOCK BAJO
router.get("/stock-bajo", async (req, res) => {
  try {
    const limite = Number(req.query.limite) || 5;

    if (!Number.isInteger(limite) || limite < 0) {
      return res.status(400).json({
        mensaje: "El límite debe ser un número entero válido",
      });
    }

    const productos = await Producto.find({
      stock: { $lte: limite },
    }).sort({ stock: 1 });

    res.json({
      mensaje: "Productos con stock bajo",
      limite,
      cantidad: productos.length,
      productos,
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al consultar el stock",
      error: error.message,
    });
  }
});

// HISTORIAL DE VENTAS
router.get("/ventas", async (req, res) => {
  try {
    const ventas = await Venta.find()
      .populate("productos.producto")
      .sort({ createdAt: -1 });

    res.json(ventas);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener el historial de ventas",
      error: error.message,
    });
  }
});

// HISTORIAL DE COMPRAS
router.get("/compras", async (req, res) => {
  try {
    const compras = await Compra.find()
      .populate("proveedor")
      .populate("productos.producto")
      .sort({ createdAt: -1 });

    res.json(compras);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener el historial de compras",
      error: error.message,
    });
  }
});

// HISTORIAL DE MOVIMIENTOS
router.get("/movimientos", async (req, res) => {
  try {
    const movimientos = await Movimiento.find()
      .populate("producto")
      .sort({ createdAt: -1 });

    res.json(movimientos);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener los movimientos",
      error: error.message,
    });
  }
});

export default router;
