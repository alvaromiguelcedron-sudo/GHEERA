
import mongoose from "mongoose";

const proveedorSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true
    },

    razonSocial: {
      type: String,
      default: "",
      trim: true
    },

    cuit: {
      type: String,
      default: "",
      trim: true
    },

    telefono: {
      type: String,
      default: "",
      trim: true
    },

    email: {
      type: String,
      default: "",
      trim: true,
      lowercase: true
    },

    direccion: {
      type: String,
      default: "",
      trim: true
    },

    observaciones: {
      type: String,
      default: ""
    },

    activo: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

const Proveedor = mongoose.model(
  "Proveedor",
  proveedorSchema
);

export default Proveedor;
