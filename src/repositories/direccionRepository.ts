import db from "../config/db";
import { Direcciones } from "../interfaces/index";
import { PoolConnection, ResultSetHeader, RowDataPacket } from "mysql2/promise";

class direccionRepostory {
  async findDirById(id: number): Promise<Direcciones | null | undefined> {
    const query = `SELECT * FROM DIRECCIONES WHERE ID_DIRECCIONES = ?`;
    const [rows] = await db.query<Direcciones[]>(query, [id]);
    
    return rows.length > 0 ? rows[0] : null;
  }
}

export default new direccionRepostory();