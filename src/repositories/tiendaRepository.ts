import db from "../config/db";
import { Tiendas, Direcciones } from "../interfaces/index";
import { PoolConnection, ResultSetHeader, RowDataPacket } from "mysql2/promise";

class TiendaRepository {
  async crearTiendaConTransaccion(
    shop: Partial<Tiendas>,
    dir: Partial<Direcciones>,
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

  async findById(id:number): Promise<Tiendas | null | undefined> {
    const query = `
      SELECT * FROM TIENDAS WHERE ID_TIENDA = ?
    `;
    
    const [rows] = await db.query<Tiendas[]>(query,[id]);
    return rows.length > 0 ? rows[0] : null;
  }
  
  
}

export default new TiendaRepository();
