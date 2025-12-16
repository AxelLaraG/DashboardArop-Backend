import db from "../config/db";
import { Usuario } from "../interfaces/usuario";
import { RowDataPacket, ResultSetHeader } from "mysql2";

class UsuarioRepository {

  async findAllByRole(idRol:number): Promise<RowDataPacket[]> {
    const query = `
      SELECT
        U.ID_USUARIO,
        U.NOMBRE,
        U.APELLIDO_1,
        U.APELLIDO_2,
        U.EMAIL,
        R.ROL as ROL_NAME,
        E.ESTATUS as ESTATUS_NAME,
        U.FECHA_ALTA,
        U.CREDITO
      FROM USUARIOS U
      LEFT JOIN CAT_ROLES R ON U.ID_ROL = R.ID_ROL
      LEFT JOIN CAT_ESTATUS_USUARIOS E ON U.ID_ESTATUS = E.ID_ESTATUS
      WHERE U.ID_ROL = ?
    `;

    const [rows] = await db.query<RowDataPacket[]>(query,[idRol]);
    return rows;
  }
  
  async findByEmail(email: string): Promise<Usuario | null | undefined> {
    const query = "SELECT * FROM USUARIOS WHERE EMAIL = ?";
    const [rows] = await db.query<Usuario[]>(query, [email]);

    return rows.length > 0 ? rows[0] : null;
  }

  async createUsr(usuario: Partial<Usuario>): Promise<number> {
    const query = `
      INSERT INTO USUARIOS (NOMBRE, APELLIDO_1, APELLIDO_2, EMAIL, PASSWORD, ID_ROL, ID_ESTATUS, FECHA_ALTA, CREDITO)
      VALUES (?,?,?,?,?,?,1,NOW(),?)
    `;

    const [result] = await db.query<ResultSetHeader>(query, [
      usuario.NOMBRE,
      usuario.APELLIDO_1,
      usuario.APELLIDO_2 || null,
      usuario.EMAIL,
      usuario.PASSWORD,
      usuario.ID_ROL,
      usuario.CREDITO,
    ]);

    return result.insertId;
  }

  async findById(id: number): Promise<Usuario | null | undefined> {
    const query = "SELECT * FROM USUARIOS WHERE ID_USUARIO = ?";
    const [rows] = await db.query<Usuario[]>(query, [id]);
    return rows.length > 0 ? rows[0] : null;
  }
  
  async updatePassword(id: number, pass: string): Promise<boolean> { 
    const query = 'UPDATE USUARIOS SET PASSWORD = ? WHERE ID_USUARIO = ?';
    
    const [res] = await db.query<ResultSetHeader>(query, [pass, id]);
   
    return res.affectedRows > 0; 
  }
}

export default new UsuarioRepository();
