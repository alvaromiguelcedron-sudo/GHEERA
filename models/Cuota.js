
import mongoose from "mongoose";

const cuotaSchema = new mongoose.Schema(
  {
    cuentaCorriente: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CuentaCorriente",
      required: true,
    },

    numeroCuota: {
      type: Number,
      required: true,
      min: 1,
    },

    capital: {
      type: Number,
      required: true,
      min: 0,
    },

    fechaVencimiento: {
      type: Date,
      required: true,
    },

    porcentajeDiario: {
      type: Number,
      default: 0.5,
      min: 0,
    },

    diasAtraso: {
      type: Number,
      default: 0,
      min: 0,
    },

    recargo: {
      type: Number,
      default: 0,
      min: 0,
    },

    total: {
      type: Number,
      required: true,
      min: 0,
    },

    saldoPendiente: {
      type: Number,
      required: true,
      min: 0,
    },

    estado: {
      type: String,
      enum: ["pendiente", "pagada", "vencida"],
      default: "pendiente",
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
  { timestamps: true }
);

cuotaSchema.index(
  { cuentaCorriente: 1, numeroCuota: 1 },
  { unique: true }
);

const Cuota = mongoose.model("Cuota", cuotaSchema);

export default Cuota;
