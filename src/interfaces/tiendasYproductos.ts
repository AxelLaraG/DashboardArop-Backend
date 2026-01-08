import type { RowDataPacket } from "mysql2";

export interface Tiendas extends RowDataPacket {
  ID_TIENDA: number;
  ID_ESTATUS: number;
  ID_DIRECCION: number;
  NOMBRE_LEGAL: string;
  NOMBRE_COMERCIAL: string;
  LOGO: string;
  DESCRIPCION: string;
  EMAIL: string;
  TELEFONO: string;
  CLABE_IBAN: string;
  RFC: string;
}

export interface Propietarios extends RowDataPacket {
  ID_TIENDA: number;
  ID_USUARIO: number;
  FECHA_ASIGNACION: Date;
  ES_PRINCIPAL: boolean;
}

export interface Productos extends RowDataPacket {
  ID_PRODUCTO: number;
  ID_TIENDA: number;
  DESC_CORTA: string;
  DESCRIPCION: string;
  NOMBRE: string;
  STOCK_TOTAL: number;
  STOCK_WARN: number;
}

export interface VariantesProductos extends RowDataPacket {
  ID_VARIANTE: number;
  ID_PRODUCTO: number;
  ID_COLOR: number;
  ID_ESTATUS: number;
  DESCUENTO: number;
  PRECIO: number;
  FOTO: string;
  IND_ALMACEN: boolean;
  STOCK: number;
  STOCK_WARN: number;
}

export interface VarianteEdit {
  idVariante?: number;
  idColor: number;
  descuento: number;
  precio: number;
  foto?: string;
  indAlmacen: boolean;
  stock: number;
  stockWarn: number;
}

export interface ProductoEdit {
  nombre?: string;
  descCorta?: string;
  descripcion?: string;
  stockWarn?: number;
}

export type NewTienda = Omit<
  Tiendas,
  "ID_TIENDA" | "ID_ESTATUS" | "ID_DIRECCION"
> & {
  ID_DIRECCION?: number;
};

export type NewPropietario = Omit<Propietarios, "FECHA_ASIGNACION">;
export type NewProducto = Omit<Productos, "ID_PRODUCTO">;

export type NewVarianteProducto = Omit<
  VariantesProductos,
  "ID_VARIANTE" | "ID_ESTATUS" | "ID_PRUDCTO"
> & {
  ID_PRODUCTO?: number;
};

