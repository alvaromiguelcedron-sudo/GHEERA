
import mongoose from "mongoose";

const cajaSchema = new mongoose.Schema(
  {
    montoInicial: {
      type: Number,
      required: true,
      min: 0,
    },

    totalIngresos: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalEgresos: {
      type: Number,
      default: 0,
      min: 0,
    },

    saldoEsperado: {
      type: Number,
      required: true,
      min: 0,
    },

    montoContado: {
      type: Number,
      default: null,
      min: 0,
    },

    diferencia: {
      type: Number,
      default: null,
    },

    estado: {
      type: String,
      enum: ["abierta", "cerrada"],
      default: "abierta",
    },

    fechaApertura: {
      type: Date,
      default: Date.now,
    },

    fechaCierre: {
      type: Date,
      default: null,
    },

    observaciones: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Evitar que existan dos cajas abiertas al mismo tiempo
cajaSchema.index(
  { estado: 1 },
  {
    unique: true,
    partialFilterExpression: {
      estado: "abierta",
    },
  }
);

const Caja = mongoose.model("Caja", cajaSchema);

export default Caja;
