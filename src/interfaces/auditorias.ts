import type { RowDataPacket } from "mysql2";

export interface Auditorias extends RowDataPacket {
  ID_AUDITORIA: number;
  ID_USUARIO: number;
  TABLA: string;
  TRANSACCION: string;
  FECHA: Date;
  USER_AGENT: string;
}
