import type { RowDataPacket } from "mysql2";

export interface Usuario extends RowDataPacket {
  ID_USUARIO: number;
  ID_ROL: number;
  ID_ESTATUS: number;
  EMAIL: string;
  PASSWORD: string;
  NOMBRE: string;
  APELLIDO_1: string;
  APELLIDO_2?: string;
  FECHA_ALTA: Date;
  FOTO_PERFIL?: string;
  CREDITO: string;
}

export interface Direcciones extends RowDataPacket {
  ID_DIRECCION: number;
  DIRECCION: string;
  CP: string;
  ESTADO: string;
  MUNICIPIO: string;
  LOCALIDAD: string;
  COLONIA: string;
  NO_INTERIOR: string;
  INDICACIONES: string;
  TIPO_DOMICILIO: string;
  NOMBRE_CONTACTO: string;
  TEL_CONTACTO: string;
}

export interface UsuariosDir extends RowDataPacket {
  ID_USUARIO: number;
  ID_DIRECCION: number;
  ID_TIPO: number;
}
