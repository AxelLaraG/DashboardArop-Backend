import db from "../config/db";
import {
  Productos,
  VariantesProductos,
  NewProducto,
  NewVarianteProducto,
} from "../interfaces";
import { PoolConnection, ResultSetHeader, RowDataPacket } from "mysql2/promise";

class ProductosRepository {
  async crearProductoConVariantes(
    prod: NewProducto,
    variantes: NewVarianteProducto[],
  ): Promise<number> {
    let conn: PoolConnection | null = null;

    try {
      conn = await db.getConnection();
      await conn.beginTransaction();

      const queryProd = `
        INSERT INTO PRODUCTOS (ID_TIENDA, NOMBRE, DESC_CORTA, DESCRIPCION, STOCK_TOTAL, STOCK_WARN)
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      const [resProd] = await conn.query<ResultSetHeader>(queryProd, [
        prod.ID_TIENDA,
        prod.NOMBRE,
        prod.DESC_CORTA,
        prod.DESCRIPCION,
        prod.STOCK_TOTAL,
        prod.STOCK_WARN,
      ]);

      const idProd = resProd.insertId;

      const queryVar = `
        INSERT INTO VARIANTES_PRODUCTOS
        (ID_PRODUCTO, ID_COLOR, ID_ESTATUS, DESCUENTO, PRECIO, FOTO, IND_ALMACEN, STOCK, STOCK_WARN)
        VALUES ?
      `;

      const valVar = variantes.map((v) => [
        idProd,
        v.ID_COLOR,
        1,
        v.DESCUENTO,
        v.PRECIO,
        v.FOTO || "",
        v.IND_ALMACEN,
        v.STOCK,
        v.STOCK_WARN,
      ]);

      await conn.query(queryVar, [valVar]);

      await conn.commit();

      return idProd;
    } catch (e) {
      if (conn) await conn.rollback();
      throw e;
    } finally {
      if (conn) conn.release();
    }
  }

  async getProductoPorTienda(idTienda: number): Promise<RowDataPacket[]> {
    const query = `
      SELECT
        P.ID_PRODUCTO,
        P.NOMBRE,
        P.DESC_CORTA,
        P.STOCK_TOTAL,
        MIN(VP.PRECIO) as PRECIO_DESDE,
        (SELECT FOTO
          FROM VARIANTES_PRODUCTOS
          WHERE ID_PRODUCTO = P.ID_PRODUCTO
          LIMIT 1) as FOTO_PORTADA,
        FROM PRODUCTOS P
        LEFT JOIN VARIANTES_PRODUCTOS VP ON P.ID_PRODUCTO = VP.ID_PRODUCTO
        WHERE P.ID_TIENDA = ?
        GROUP BY P.ID_PRODUCTO
    `;

    const [rows] = await db.query<RowDataPacket[]>(query, [idTienda]);

    return rows;
  }

  async getDetalleProducto(idProducto: number): Promise<any> {
    const queryProd = "SELECT * FROM PRODUCTOS WHERE ID_PRODUCTO = ?";
    const queryVar = "SELECT *  FROM VARIANTES_PRODUCTO WHERE ID_PRODUCTO = ?";

    const [rowsProd] = await db.query<RowDataPacket[]>(queryProd, [idProducto]);
    const [rowsVar] = await db.query<RowDataPacket[]>(queryVar, [idProducto]);

    if (rowsProd.length === 0) return null;

    return {
      ...rowsProd[0],
      variantes: rowsVar,
    };
  }

  
}

export default new ProductosRepository();
