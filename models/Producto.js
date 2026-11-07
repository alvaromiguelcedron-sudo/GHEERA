
import mongoose from "mongoose";

const productoSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true
    },

    codigo: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    descripcion: {
      type: String,
      default: "",
      trim: true
    },

    precioCompra: {
      type: Number,
      required: true,
      min: 0
    },

    precio: {
      type: Number,
      required: true,
      min: 0
    },

    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },

    categoria: {
      type: String,
      required: true,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

const Producto = mongoose.model("Producto", productoSchema);

export default Producto;
