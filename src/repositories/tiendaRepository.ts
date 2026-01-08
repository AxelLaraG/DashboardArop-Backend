import db from "../config/db";
import { Tiendas, Direcciones, Propietarios, NewTienda, NewDireccion } from "../interfaces/index";
import { PoolConnection, ResultSetHeader, RowDataPacket } from "mysql2/promise";

class TiendaRepository {
  async crearTiendaConTransaccion(
    shop: NewTienda,
    dir: NewDireccion,
    propietario: number,
  ): Promise<number> {
    let conn: PoolConnection | null = null;

    try {
      conn = await db.getConnection();
      await conn.beginTransaction();

      // Insertando Dirección
      const queryDir = `INSERT INTO
        DIRECCIONES(DIRECCION, CP, ESTADO, MUNICIPIO, LOCALIDAD, COLONIA,
          NO_INTERIOR, INDICACIONES, TIPO_DOMICILIO, NOMBRE_CONTACTO, TEL_CONTACTO)
        VALUES (?,?,?,?,?,?,?,?,?,?,?)`;

      const [resDir] = await conn.query<ResultSetHeader>(queryDir, [
        dir.DIRECCION,
        dir.CP,
        dir.ESTADO,
        dir.MUNICIPIO,
        dir.LOCALIDAD,
        dir.COLONIA,
        dir.NO_INTERIOR || "",
        dir.INDICACIONES,
        dir.TIPO_DOMICILIO,
        dir.NOMBRE_CONTACTO,
        dir.TEL_CONTACTO,
      ]);

      const idNewDir = resDir.insertId;

      // Insertando Tienda
      const queryShop = `INSERT INTO TIENDAS (
          ID_ESTATUS, ID_DIRECCION, NOMBRE_LEGAL, NOMBRE_COMERCIAL,
          LOGO, DESCRIPCION, EMAIL, TELEFONO, CLABE_IBAN, RFC
        ) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

      const [resShop] = await conn.query<ResultSetHeader>(queryShop, [
        idNewDir,
        shop.NOMBRE_LEGAL,
        shop.NOMBRE_COMERCIAL,
        shop.LOGO || null,
        shop.DESCRIPCION,
        shop.EMAIL,
        shop.TELEFONO,
        shop.CLABE_IBAN,
        shop.RFC,
      ]);

      const idNewShop = resShop.insertId;

      // Insertando dueño
      const queryProp = `
        INSERT INTO PROPIETARIOS_TIENDA (
          ID_TIENDA, ID_USUARIO, FECHA_ASIGNACION, ES_PRINCIPAL
        ) VALUES (?, ?, NOW(), 1)
      `;

      await conn.query<ResultSetHeader>(queryProp, [idNewShop, propietario]);

      await conn.commit();

      return idNewShop;
    } catch (e) {
      if (conn) await conn.rollback();
      throw e;
    } finally {
      if (conn) conn.release();
    }
  }

  async getTiendas(): Promise<RowDataPacket[]> {
    const query = `
      SELECT
        T.NOMBRE_LEGAL,
        T.NOMBRE_COMERCIAL,
        T.LOGO,
        T.DESCRIPCION,
        T.EMAIL,
        T.TELEFONO,
        T.CLABE_IBAN,
        T.RFC,
        E.ESTATUS as ESTATUS_NAME
      FROM TIENDAS T
      LEFT JOIN CAT_ESTATUS_TIENDA E ON T.ID_ESTATUS = E.ID_ESTATUS
      `;

    const [rows] = await db.query<RowDataPacket[]>(query);
    return rows;
  }

  async findById(id: number): Promise<Tiendas | null | undefined> {
    const query = `
      SELECT * FROM TIENDAS WHERE ID_TIENDA = ?
    `;

    const [rows] = await db.query<Tiendas[]>(query, [id]);
    return rows.length > 0 ? rows[0] : null;
  }

  async actualizarTiendaConTransaccion(
    idShop: number,
    shop: Partial<Tiendas>,
    dir: Partial<Direcciones>,
  ): Promise<boolean> {
    let conn: PoolConnection | null = null;

    try {
      conn = await db.getConnection();
      await conn.beginTransaction();

      const queryDir = `SELECT ID_DIRECCION FROM TIENDAS WHERE ID_TIENDA = ? FOR UPDATE`;
      const [tiendaRows] = await conn.query<RowDataPacket[]>(queryDir, [
        idShop,
      ]);

      if (tiendaRows.length === 0) {
        throw new Error("Tienda no encontrada");
      }

      const idDir = tiendaRows[0]?.ID_DIRECCION;

      if (Object.keys(dir).length > 0) {
        const setClause = Object.keys(dir)
          .map((key) => `${key} = ?`)
          .join(", ");
        const values = Object.values(dir);
        const queryDir = `UPDATE DIRECCIONES SET ${setClause} WHERE ID_DIRECCION = ?`;

        await conn.query(queryDir, [...values, idDir]);
      }

      if (Object.keys(shop).length > 0) {
        const setClause = Object.keys(shop)
          .map((key) => `${key} = ?`)
          .join(", ");
        const values = Object.values(shop);
        const queryShop = `UPDATE TIENDAS SET ${setClause} WHERE ID_TIENDA = ?`;

        await conn.query(queryShop, [...values, idShop]);
      }

      await conn.commit();

      return true;
    } catch (e) {
      if (conn) await conn.rollback();
      throw e;
    } finally {
      if (conn) conn.release();
    }
  }

  async getOwnersFromShop(shopId: number): Promise<RowDataPacket[]> {
    const query = `
      SELECT
        U.NOMBRE,
        U.APELLIDO_1,
        U.APELLIDO_2,
        U.EMAIL,
        U.FOTO_PERFIL,
        PT.ES_PRINCIPAL,
        PT.FECHA_ASIGNACION
      FROM USUARIOS U
      INNER JOIN PROPIETARIOS_TIENDA PT ON U.ID_USUARIO = PT.ID_USUARIO
      WHERE PT.ID_TIENDA = ?
      `;

    const [rows] = await db.query<RowDataPacket[]>(query, [shopId]);
    return rows;
  }

  async addOwner(usrId: number, shopId: number): Promise<boolean> {
    const query = `INSERT INTO PROPIETARIOS_TIENDA (ID_TIENDA, ID_USUARIO, FECHA_ASIGNACION, ES_PRINCIPAL) VALUES (?, ?, NOW(), 0)`;
    const [res] = await db.query<ResultSetHeader>(query, [shopId, usrId]);
    return res.affectedRows > 0;
  }

  async deleteOwner(userId: number, shopId: number): Promise<boolean> {
    const query = `DELETE FROM PROPIETARIOS_TIENDA WHERE ID_USER = ? AND ID_TIENDA = ?`;
    const [res] = await db.query<ResultSetHeader>(query, [userId, shopId]);
    return res.affectedRows > 0;
  }

  async validateOwner(usrId: number, shopId: number): Promise<boolean> {
    const query = `SELECT EXISTS(
      SELECT 1
      FROM PROPIETARIOS_TIENDA
      WHERE ID_TIENDA = ? AND ID_USUARIO = ?
    ) as existe`;

    const [rows] = await db.query<RowDataPacket[]>(query, [shopId, usrId]);

    return rows[0]?.existe === 1;
  }
}

export default new TiendaRepository();
