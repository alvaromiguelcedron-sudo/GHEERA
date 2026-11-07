
import express from "express";
import Proveedor from "../models/Proveedor.js";

const router = express.Router();

// GET: consultar todos los proveedores
router.get("/", async (req, res) => {
  try {
    const proveedores = await Proveedor.find()
      .sort({ nombre: 1 });

    res.status(200).json(proveedores);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al consultar proveedores",
      error: error.message
    });
  }
});

// GET: consultar un proveedor por ID
router.get("/:id", async (req, res) => {
  try {
    const proveedor = await Proveedor.findById(req.params.id);

    if (!proveedor) {
      return res.status(404).json({
        mensaje: "Proveedor no encontrado"
      });
    }

    res.status(200).json(proveedor);
  } catch (error) {
    res.status(400).json({
      mensaje: "ID de proveedor inválido",
      error: error.message
    });
  }
});

// POST: registrar un proveedor
router.post("/", async (req, res) => {
  try {
    const {
      nombre,
      razonSocial,
      cuit,
      telefono,
      email,
      direccion,
      observaciones
    } = req.body;

    if (!nombre || !nombre.trim()) {
      return res.status(400).json({
        mensaje: "El nombre del proveedor es obligatorio"
      });
    }

    const nuevoProveedor = new Proveedor({
      nombre,
      razonSocial,
      cuit,
      telefono,
      email,
      direccion,
      observaciones
    });

    await nuevoProveedor.save();

    res.status(201).json({
      mensaje: "Proveedor registrado correctamente",
      proveedor: nuevoProveedor
    });
  } catch (error) {
    res.status(400).json({
      mensaje: "Error al registrar proveedor",
      error: error.message
    });
  }
});

// PUT: modificar un proveedor
router.put("/:id", async (req, res) => {
  try {
    const proveedorActualizado = await Proveedor.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!proveedorActualizado) {
      return res.status(404).json({
        mensaje: "Proveedor no encontrado"
      });
    }

    res.status(200).json({
      mensaje: "Proveedor actualizado correctamente",
      proveedor: proveedorActualizado
    });
  } catch (error) {
    res.status(400).json({
      mensaje: "Error al actualizar proveedor",
      error: error.message
    });
  }
});

// DELETE: desactivar un proveedor
router.delete("/:id", async (req, res) => {
  try {
    const proveedor = await Proveedor.findByIdAndUpdate(
      req.params.id,
      { activo: false },
      { new: true }
    );

    if (!proveedor) {
      return res.status(404).json({
        mensaje: "Proveedor no encontrado"
      });
    }

    res.status(200).json({
      mensaje: "Proveedor desactivado correctamente",
      proveedor
    });
  } catch (error) {
    res.status(400).json({
      mensaje: "Error al desactivar proveedor",
      error: error.message
    });
  }
});

export default router;
