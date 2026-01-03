import type { RowDataPacket } from "mysql2";

export interface MetodosPago extends RowDataPacket {
  ID_METODO: number;
  ID_USUARIO: number;
  ID_ESTATUS: number;
  ID_TIPO: number;
  TOKEN: string;
  NUM_ENMASC: string;
  FECHA_VENC: string;
  NOMBRE_TITULAR: string;
  TIPO_TARJETA: string;
}

export interface Pedidos extends RowDataPacket {
  ID_PEDIDO: number;
  ID_USUARIO: number;
  ID_METODO: number;
  ID_ESTATUS: number;
  FECHA_PEDIDO: Date;
  COSTO_TOTAL: number;
  IVA: number;
}

export interface Transacciones extends RowDataPacket {
  ID_TRANSACCION: number;
  ID_PEDIDO: number;
  ID_METODO: number;
  ID_ESTATUS: number;
  FECHA_TRANSACCION: Date;
  FOLIO_EXTERNO: string;
  MONTO: number;
  CODIGO_RESPUESTA: number;
  MENSAJE_RESPUESTA: string;
  JSON_RAW_API: string;
}

export interface DetallesPedidos extends RowDataPacket {
  ID_DETALLE: number;
  ID_VARIANTE: number;
  ID_PEDIDO: number;
  CANTIDAD_PRODUCTOS: number;
  PRECIO_UNITARIO: number;
  SUBTOTAL: number;
}

export type NewMetodoPago = Omit<MetodosPago, "ID_METODO">;
export type NewPedido = Omit<Pedidos, "ID_PEDIDO" | "FECHA_PEDIDO">;
export type NewTransaccion = Omit<
  Transacciones,
  "ID_TRANSACCION" | "FECHA_TRANSACCION" | "ID_PEDIDO"
> & {
  ID_PEDIDO?: number;
};
export type NewDetallePedidos = Omit<
  DetallesPedidos,
  "ID_DETALLE" | "ID_PEDIDO"
> & {
  ID_PEDIDO?: number;
};
