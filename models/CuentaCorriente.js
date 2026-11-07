
import mongoose from "mongoose";

const cuentaCorrienteSchema = new mongoose.Schema(
  {
    cliente: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cliente",
      required: true,
    },

    montoInicial: {
      type: Number,
      required: true,
      min: 0,
    },

    saldoPendiente: {
      type: Number,
      required: true,
      min: 0,
    },

    tasaInteres: {
      type: Number,
      default: 0,
      min: 0,
    },

    periodicidad: {
      type: String,
      enum: ["semanal", "quincenal", "mensual"],
      required: true,
    },

    fechaInicio: {
      type: Date,
      default: Date.now,
    },

    proximoVencimiento: {
      type: Date,
      required: true,
    },

    estado: {
      type: String,
      enum: ["pendiente", "pagado", "vencido"],
      default: "pendiente",
    },

    observaciones: {
      type: String,
      default: "",
    },

    pagos: [
      {
        monto: {
          type: Number,
          required: true,
          min: 0,
        },

        fechaPago: {
          type: Date,
          default: Date.now,
        },

        observacion: {
          type: String,
          default: "",
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const CuentaCorriente = mongoose.model(
  "CuentaCorriente",
  cuentaCorrienteSchema
);

export default CuentaCorriente;
