
import mongoose from "mongoose";

const movimientoSchema = new mongoose.Schema(
  {
    producto: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Producto",
      required: true
    },

    tipo: {
      type: String,
      enum: ["entrada", "salida"],
      required: true
    },

    cantidad: {
      type: Number,
      required: true,
      min: 1
    },

    motivo: {
      type: String,
      required: true,
      trim: true
    },

    observacion: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

const Movimiento = mongoose.model(
  "Movimiento",
  movimientoSchema
);

export default Movimiento;
