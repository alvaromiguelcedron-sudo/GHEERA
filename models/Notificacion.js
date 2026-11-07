
import mongoose from "mongoose";

const notificacionSchema = new mongoose.Schema(
  {
    cliente: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cliente",
      required: true,
    },

    cuentaCorriente: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CuentaCorriente",
      required: true,
    },

    tipo: {
      type: String,
      enum: ["proximo_vencimiento", "vencido"],
      required: true,
    },

    mensaje: {
      type: String,
      required: true,
    },

    fechaEnvioProgramada: {
      type: Date,
      required: true,
    },

    estado: {
      type: String,
      enum: ["pendiente", "enviada", "fallida"],
      default: "pendiente",
    },

    canal: {
      type: String,
      enum: ["sistema", "whatsapp", "email"],
      default: "sistema",
    },

    fechaEnvio: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Evita generar dos avisos del mismo tipo
// para una misma cuenta y fecha programada.
notificacionSchema.index(
  {
    cuentaCorriente: 1,
    tipo: 1,
    fechaEnvioProgramada: 1,
  },
  {
    unique: true,
  }
);

const Notificacion = mongoose.model(
  "Notificacion",
  notificacionSchema
);

export default Notificacion;
