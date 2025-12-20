import db from "../config/db";
import { Auditorias } from "../interfaces";
import { RowDataPacket, ResultSetHeader } from "mysql2";

class AuditoriasRepository {
  async getAuditorias(): Promise<Auditorias[]> {
    const query = "SELECT * FROM AUDITORIAS";
    const [rows] = await db.query<Auditorias[]>(query);
    return rows;
  }

  async setNewAuditoria(auditoria: Partial<Auditorias>): Promise<number> {
    const query = `INSERT INTO AUDITORIAS (ID_USUARIO, TABLA, TRANSACCION, FECHA, USER_AGENT) VALUES (?,?,?,NOW(),?)`;
    const [result] = await db.query<ResultSetHeader>(query, [
      auditoria.ID_USUARIO,
      auditoria.TABLA,
      auditoria.TRANSACCION,
      auditoria.USER_AGENT,
    ]);

    return result.insertId;
  }

  async getAuditoriasByTable(table: string): Promise<RowDataPacket[]> {
    const query = "SELECT * FROM AUDITORIAS WHERE TABLA = ?";
    const [rows] = await db.query<RowDataPacket[]>(query,[table]);
    return rows;
  }
}

export default new AuditoriasRepository();