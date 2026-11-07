
import express from "express";
import Producto from "../models/Producto.js";

const router = express.Router();

// GET: listar todos los productos
router.get("/", async (req, res) => {
  try {
    const productos = await Producto.find();
    res.status(200).json(productos);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener los productos",
      error: error.message
    });
  }
});

// GET: buscar producto por ID
router.get("/:id", async (req, res) => {
  try {
    const producto = await Producto.findById(req.params.id);

    if (!producto) {
      return res.status(404).json({
        mensaje: "Producto no encontrado"
      });
    }

    res.status(200).json(producto);
  } catch (error) {
    res.status(400).json({
      mensaje: "ID inválido",
      error: error.message
    });
  }
});

// POST: registrar un producto
router.post("/", async (req, res) => {
  try {
    const producto = new Producto(req.body);
    const productoGuardado = await producto.save();

    res.status(201).json(productoGuardado);
  } catch (error) {
    res.status(error.code === 11000 ? 409 : 400).json({
      mensaje: "Error al registrar el producto",
      error: error.message
    });
  }
});

// PUT: modificar un producto
router.put("/:id", async (req, res) => {
  try {
    const productoActualizado = await Producto.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!productoActualizado) {
      return res.status(404).json({
        mensaje: "Producto no encontrado"
      });
    }

    res.status(200).json(productoActualizado);
  } catch (error) {
    res.status(400).json({
      mensaje: "Error al actualizar el producto",
      error: error.message
    });
  }
});

// DELETE: eliminar un producto
router.delete("/:id", async (req, res) => {
  try {
    const productoEliminado = await Producto.findByIdAndDelete(
      req.params.id
    );

    if (!productoEliminado) {
      return res.status(404).json({
        mensaje: "Producto no encontrado"
      });
    }

    res.status(200).json({
      mensaje: "Producto eliminado correctamente",
      producto: productoEliminado
    });
  } catch (error) {
    res.status(400).json({
      mensaje: "Error al eliminar el producto",
      error: error.message
    });
  }
});

export default router;
