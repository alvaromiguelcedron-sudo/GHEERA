
import mongoose from "mongoose";

const detalleVentaSchema = new mongoose.Schema(
  {
    producto: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Producto",
      required: true,
    },

    nombreProducto: {
      type: String,
      required: true,
    },

    cantidad: {
      type: Number,
      required: true,
      min: 1,
    },

    precioCompra: {
      type: Number,
      required: true,
      min: 0,
    },

    precioVenta: {
      type: Number,
      required: true,
      min: 0,
    },

    subtotal: {
      type: Number,
      required: true,
    },

    ganancia: {
      type: Number,
      required: true,
    },
  },
  {
    _id: false,
  }
);

const ventaSchema = new mongoose.Schema(
  {
    cliente: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cliente",
      default: null,
    },

    tipoVenta: {
      type: String,
      enum: ["contado", "credito"],
      default: "contado",
    },

    estadoPago: {
      type: String,
      enum: ["pagada", "pendiente", "parcial"],
      default: "pagada",
    },

    cuentaCorriente: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CuentaCorriente",
      default: null,
    },

    productos: {
      type: [detalleVentaSchema],
      required: true,
      validate: {
        validator: (productos) => productos.length > 0,
        message: "La venta debe tener al menos un producto",
      },
    },

    total: {
      type: Number,
      required: true,
      min: 0,
    },

    gananciaTotal: {
      type: Number,
      required: true,
    },

    fecha: {
      type: Date,
      default: Date.now,
    },

    observacion: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const Venta = mongoose.model("Venta", ventaSchema);

export default Venta;
