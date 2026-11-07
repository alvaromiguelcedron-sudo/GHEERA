
import mongoose from "mongoose";

const detalleCompraSchema = new mongoose.Schema({
  producto: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Producto",
    required: true
  },
  nombreProducto: {
    type: String,
    required: true
  },
  cantidad: {
    type: Number,
    required: true,
    min: 1
  },
  precioCompra: {
    type: Number,
    required: true,
    min: 0
  },
  subtotal: {
    type: Number,
    required: true,
    min: 0
  }
});

const pagoCompraSchema = new mongoose.Schema({
  monto: {
    type: Number,
    required: true,
    min: 0.01
  },
  fechaPago: {
    type: Date,
    default: Date.now
  },
  observacion: {
    type: String,
    default: ""
  }
});

const compraSchema = new mongoose.Schema(
  {
    proveedor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Proveedor",
      required: true
    },
    productos: {
      type: [detalleCompraSchema],
      required: true
    },
    total: {
      type: Number,
      required: true,
      min: 0
    },
    montoPagado: {
      type: Number,
      default: 0,
      min: 0
    },
    saldoPendiente: {
      type: Number,
      required: true,
      min: 0
    },
    estadoPago: {
      type: String,
      enum: ["pendiente", "parcial", "pagada"],
      default: "pendiente"
    },
    pagos: {
      type: [pagoCompraSchema],
      default: []
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

const Compra = mongoose.model("Compra", compraSchema);

export default Compra;
