
import mongoose from "mongoose";

const movimientoCajaSchema = new mongoose.Schema(
  {
    caja: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Caja",
      required: true,
    },

    tipo: {
      type: String,
      enum: ["ingreso", "egreso"],
      required: true,
    },

    categoria: {
      type: String,
      enum: [
        "venta_contado",
        "cobro_cuota",
        "otro_ingreso",
        "compra_proveedor",
        "gasto",
        "retiro",
        "otro_egreso",
      ],
      required: true,
    },

    monto: {
      type: Number,
      required: true,
      min: 0.01,
    },

    descripcion: {
      type: String,
      default: "",
      trim: true,
    },

    referencia: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    referenciaModelo: {
      type: String,
      enum: ["Venta", "Cuota", "Compra", null],
      default: null,
    },

    fecha: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

movimientoCajaSchema.index({
  caja: 1,
  fecha: -1,
});

const MovimientoCaja = mongoose.model(
  "MovimientoCaja",
  movimientoCajaSchema
);

export default MovimientoCaja;
