import type { RowDataPacket } from 'mysql2';

export interface Usuario extends RowDataPacket { 
  ID_USUARIO: number,
  ID_ROL: number,
  ID_ESTATUS: number,
  EMAIL: string,
  PASSWORD: string,
  NOMBRE: string,
  APELLIDO_1: string,
  APELLIDO_2: string,
  CREDITO: string
}

