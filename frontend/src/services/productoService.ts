
import axios from "axios";

const API_URL = "http://localhost:3000/api/productos";

export interface Producto {
  _id: string;
  nombre: string;
  codigo: string;
  descripcion: string;
  precioCompra: number;
  precio: number;
  stock: number;
  categoria: string;
}

export interface ProductoNuevo {
  nombre: string;
  codigo: string;
  descripcion: string;
  precioCompra: number;
  precio: number;
  stock: number;
  categoria: string;
}

// Obtener todos los productos
export const obtenerProductos = async (): Promise<Producto[]> => {
  const respuesta = await axios.get<Producto[]>(API_URL);
  return respuesta.data;
};

// Registrar un producto
export const crearProducto = async (
  producto: ProductoNuevo
): Promise<Producto> => {
  const respuesta = await axios.post<Producto>(API_URL, producto);
  return respuesta.data;
};

// Actualizar un producto
export const actualizarProducto = async (
  id: string,
  producto: Partial<ProductoNuevo>
): Promise<Producto> => {
  const respuesta = await axios.put<Producto>(
    `${API_URL}/${id}`,
    producto
  );
  return respuesta.data;
};

// Eliminar un producto
export const eliminarProducto = async (id: string): Promise<void> => {
  await axios.delete(`${API_URL}/${id}`);
};
