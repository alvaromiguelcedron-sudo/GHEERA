import express from "express";
import mongoose from "mongoose";
import Notificacion from "../models/Notificacion.js";

const router = express.Router();

// GET: Obtener todas las notificaciones
router.get("/", async (req, res) => {
  try {
    const { estado, tipo } = req.query;

    const filtros = {};

    if (estado) filtros.estado = estado;
    if (tipo) filtros.tipo = tipo;

    const notificaciones = await Notificacion.find(filtros)
      .populate("cliente", "nombre apellido telefono")
      .populate("cuentaCorriente", "saldoPendiente proximoVencimiento")
      .sort({ fechaEnvioProgramada: 1 });

    res.json(notificaciones);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener las notificaciones",
      error: error.message,
    });
  }
});

// GET: Obtener una notificación por ID
router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        mensaje: "ID de notificación inválido",
      });
    }

    const notificacion = await Notificacion.findById(req.params.id)
      .populate("cliente", "nombre apellido telefono")
      .populate("cuentaCorriente");

    if (!notificacion) {
      return res.status(404).json({
        mensaje: "Notificación no encontrada",
      });
    }

    res.json(notificacion);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener la notificación",
      error: error.message,
    });
  }
});

// PATCH: Marcar una notificación como enviada
router.patch("/:id/enviada", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        mensaje: "ID de notificación inválido",
      });
    }

    const notificacion = await Notificacion.findById(req.params.id);

    if (!notificacion) {
      return res.status(404).json({
        mensaje: "Notificación no encontrada",
      });
    }

    notificacion.estado = "enviada";
    notificacion.fechaEnvio = new Date();

    await notificacion.save();

    res.json({
      mensaje: "Notificación marcada como enviada",
      notificacion,
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al actualizar la notificación",
      error: error.message,
    });
  }
});

export default router;