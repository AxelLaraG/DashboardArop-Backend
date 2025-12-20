import type { RowDataPacket } from "mysql2";

export interface CatEstatus extends RowDataPacket {
  ID_ESTATUS: number;
  ESTATUS: string;
  DESCRIPCION: string;
}

export interface CatTipo extends RowDataPacket {
  ID_TIPO: number;
  TIPO: string;
  DESCRIPCION: string;
}

export interface CatRoles extends RowDataPacket {
  ID_ROL: number;
  ROL: string;
  DESCRIPCION: string;
}

export interface CatColores extends RowDataPacket {
  ID_COLOR: number;
  COLOR: string;
}
