
import express from "express";
import Cliente from "../models/Cliente.js";

const router = express.Router();

// REGISTRAR CLIENTE
router.post("/", async (req, res) => {
  try {
    const cliente = new Cliente(req.body);
    await cliente.save();

    res.status(201).json({
      mensaje: "Cliente registrado correctamente",
      cliente,
    });
  } catch (error) {
    res.status(400).json({
      mensaje: "Error al registrar el cliente",
      error: error.message,
    });
  }
});

// LISTAR TODOS LOS CLIENTES
router.get("/", async (req, res) => {
  try {
    const clientes = await Cliente.find().sort({ createdAt: -1 });

    res.json(clientes);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener los clientes",
      error: error.message,
    });
  }
});

// BUSCAR CLIENTE POR ID
router.get("/:id", async (req, res) => {
  try {
    const cliente = await Cliente.findById(req.params.id);

    if (!cliente) {
      return res.status(404).json({
        mensaje: "Cliente no encontrado",
      });
    }

    res.json(cliente);
  } catch (error) {
    res.status(400).json({
      mensaje: "Error al buscar el cliente",
      error: error.message,
    });
  }
});

// MODIFICAR CLIENTE
router.put("/:id", async (req, res) => {
  try {
    const cliente = await Cliente.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!cliente) {
      return res.status(404).json({
        mensaje: "Cliente no encontrado",
      });
    }

    res.json({
      mensaje: "Cliente actualizado correctamente",
      cliente,
    });
  } catch (error) {
    res.status(400).json({
      mensaje: "Error al actualizar el cliente",
      error: error.message,
    });
  }
});

// DESACTIVAR CLIENTE
router.patch("/:id/desactivar", async (req, res) => {
  try {
    const cliente = await Cliente.findByIdAndUpdate(
      req.params.id,
      { activo: false },
      { new: true }
    );

    if (!cliente) {
      return res.status(404).json({
        mensaje: "Cliente no encontrado",
      });
    }

    res.json({
      mensaje: "Cliente desactivado correctamente",
      cliente,
    });
  } catch (error) {
    res.status(400).json({
      mensaje: "Error al desactivar el cliente",
      error: error.message,
    });
  }
});

export default router;
