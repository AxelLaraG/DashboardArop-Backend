import db from "../config/db";
import { Tiendas, Direcciones, Propietarios } from "../interfaces/index";
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

  async findById(id: number): Promise<Tiendas | null | undefined> {
    const query = `
      SELECT * FROM TIENDAS WHERE ID_TIENDA = ?
    `;

    const [rows] = await db.query<Tiendas[]>(query, [id]);
    return rows.length > 0 ? rows[0] : null;
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

  async actualizarTiendaConTransaccion(
    idShop: number,
    shop: Partial<Tiendas>,
    dir: Partial<Direcciones>,
  ): Promise<boolean> {
    let conn: PoolConnection | null = null;

    try {
      conn = await db.getConnection();
      await conn.beginTransaction();

      const queryDir = `SELECT ID_DIRECCION FROM TIENDAS WHERE ID_TIENDA = ?`;
      const [tiendaRows] = await conn.query<RowDataPacket[]>(queryDir, [
        idShop,
      ]);

      if (tiendaRows.length === 0) {
        throw new Error("Tienda no encontrada");
      }

      const idDir = tiendaRows[0]?.ID_DIRECCION;

      if (Object.keys(dir).length > 0) {
        const updateDirFields: string[] = [];
        const updateDirValues: any[] = [];

        if (dir.DIRECCION !== undefined) {
          updateDirFields.push("DIRECCION = ?");
          updateDirValues.push(dir.DIRECCION);
        }
        if (dir.CP !== undefined) {
          updateDirFields.push("CP = ?");
          updateDirValues.push(dir.CP);
        }
        if (dir.ESTADO !== undefined) {
          updateDirFields.push("ESTADO = ?");
          updateDirValues.push(dir.ESTADO);
        }
        if (dir.MUNICIPIO !== undefined) {
          updateDirFields.push("MUNICIPIO = ?");
          updateDirValues.push(dir.MUNICIPIO);
        }
        if (dir.LOCALIDAD !== undefined) {
          updateDirFields.push("LOCALIDAD = ?");
          updateDirValues.push(dir.LOCALIDAD);
        }
        if (dir.COLONIA !== undefined) {
          updateDirFields.push("COLONIA = ?");
          updateDirValues.push(dir.COLONIA);
        }
        if (dir.NO_INTERIOR !== undefined) {
          updateDirFields.push("NO_INTERIOR = ?");
          updateDirValues.push(dir.NO_INTERIOR);
        }
        if (dir.INDICACIONES !== undefined) {
          updateDirFields.push("INDICACIONES = ?");
          updateDirValues.push(dir.INDICACIONES);
        }
        if (dir.TIPO_DOMICILIO !== undefined) {
          updateDirFields.push("TIPO_DOMICILIO = ?");
          updateDirValues.push(dir.TIPO_DOMICILIO);
        }
        if (dir.NOMBRE_CONTACTO !== undefined) {
          updateDirFields.push("NOMBRE_CONTACTO = ?");
          updateDirValues.push(dir.NOMBRE_CONTACTO);
        }
        if (dir.TEL_CONTACTO !== undefined) {
          updateDirFields.push("TEL_CONTACTO = ?");
          updateDirValues.push(dir.TEL_CONTACTO);
        }

        if (updateDirFields.length > 0) {
          const queryDir = `UPDATE DIRECCIONES SET ${updateDirFields.join(", ")} WHERE ID_DIRECCION = ?`;

          updateDirValues.push(idDir);
          await conn.query(queryDir, updateDirValues);
        }
      }

      if (Object.keys(shop).length > 0) {
        const updateShopFields: string[] = [];
        const updateShopValues: any[] = [];

        if (shop.ID_ESTATUS !== undefined) {
          updateShopFields.push("ID_ESTATUS = ?");
          updateShopValues.push(shop.ID_ESTATUS);
        }
        if (shop.NOMBRE_LEGAL !== undefined) {
          updateShopFields.push("NOMBRE_LEGAL = ?");
          updateShopValues.push(shop.NOMBRE_LEGAL);
        }
        if (shop.NOMBRE_COMERCIAL !== undefined) {
          updateShopFields.push("NOMBRE_COMERCIAL = ?");
          updateShopValues.push(shop.NOMBRE_COMERCIAL);
        }
        if (shop.LOGO !== undefined) {
          updateShopFields.push("LOGO = ?");
          updateShopValues.push(shop.LOGO);
        }
        if (shop.DESCRIPCION !== undefined) {
          updateShopFields.push("DESCRIPCION = ?");
          updateShopValues.push(shop.DESCRIPCION);
        }
        if (shop.EMAIL !== undefined) {
          updateShopFields.push("EMAIL = ?");
          updateShopValues.push(shop.EMAIL);
        }
        if (shop.TELEFONO !== undefined) {
          updateShopFields.push("TELEFONO = ?");
          updateShopValues.push(shop.TELEFONO);
        }
        if (shop.CLABE_IBAN !== undefined) {
          updateShopFields.push("CLABE_IBAN = ?");
          updateShopValues.push(shop.CLABE_IBAN);
        }
        if (shop.RFC !== undefined) {
          updateShopFields.push("RFC = ?");
          updateShopValues.push(shop.RFC);
        }

        if (updateShopFields.length > 0) {
          const queryShop = `UPDATE TIENDAS SET ${updateShopFields.join(", ")} WHERE ID_TIENDA = ?`;

          updateShopValues.push(idShop);
          await conn.query(queryShop, updateShopValues);
        }
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
}

export default new TiendaRepository();
