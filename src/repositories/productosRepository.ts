import db from "../config/db";
import {
  Productos,
  VariantesProductos,
  NewProducto,
  NewVarianteProducto,
  ProductoEdit,
  VarianteEdit,
} from "../interfaces";
import { PoolConnection, ResultSetHeader, RowDataPacket } from "mysql2/promise";

class ProductosRepository {
  async crearProductoConVariantes(
    prod: NewProducto,
    variantes: NewVarianteProducto[]
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

  async findProducto(id: number): Promise<Productos | null | undefined> {
    const query = "SELECT * FROM PRODUCTOS WHERE ID_PRODUCTO = ?";
    const [rows] = await db.query<Productos[]>(query, [id]);
    return rows.length > 0 ? rows[0] : null;
  }

  async productoUpdate(
    idProd: number,
    prodData: ProductoEdit,
    variantes: VarianteEdit[]
  ): Promise<boolean> {
    let conn: PoolConnection | null = null;

    try {
      conn = await db.getConnection();
      await conn.beginTransaction();

      const [currentVars] = await conn.query<VariantesProductos[]>(
        "SELECT ID_VARIANTE FROM VARIANTES_PRODUCTOS WHERE ID_PRODUCTO = ? AND ID_ESTATUS = 1",
        [idProd]
      );

      const currentIds = currentVars.map((v) => v.ID_VARIANTE);
      const incomingIds = variantes
        .filter((v) => v.idVariante !== undefined)
        .map((v) => v.idVariante as number);

      const toDelete = currentIds.filter((id) => !incomingIds.includes(id));

      if (toDelete.length > 0) {
        await conn.query(
          `UPDATE VARIANTES_PRODUCTOS SET ID_ESTATUS = 2 WHERE ID_VARIANTE IN (?)`,
          [toDelete]
        );
      }

      let stockTotalCalculado = 0;

      for (const v of variantes) {
        stockTotalCalculado += v.stock;
        if (v.idVariante) {
          const query = `
            UPDATE VARIANTES_PRODUCTOS SET
              ID_COLOR = ?, 
              DESCUENTO = ?, 
              PRECIO = ?, 
              FOTO = ?, 
              IND_ALMACEN = ?, 
              STOCK = ?, 
              STOCK_WARN = ?
            WHERE ID_VARIANTE = ?
          `;
          await conn.query(query, [
            v.idColor,
            v.descuento,
            v.precio,
            v.foto,
            v.indAlmacen,
            v.stock,
            v.stockWarn,
            v.idVariante,
          ]);
        } else {
          const query = `
            INSERT INTO VARIANTES_PRODUCTOS 
            (ID_PRODUCTO, ID_COLOR, ID_ESTATUS, DESCUENTO, PRECIO, FOTO, IND_ALMACEN, STOCK, STOCK_WARN)
            VALUES (?, ?, 1, ?, ?, ?, ?, ?, ?)
          `;

          await conn.query(query, [
            idProd,
            v.idColor,
            v.descuento,
            v.precio,
            v.foto || "",
            v.indAlmacen,
            v.stock,
            v.stockWarn,
          ]);
        }
      }

      const camposProducto: any = { ...prodData };
      camposProducto.STOCK_TOTAL = stockTotalCalculado;

      if (Object.keys(camposProducto).length > 0) {
        const setClause = Object.keys(camposProducto)
          .map((key) => {
            const dbKey =
              key === "descCorta"
                ? "DESC_CORTA"
                : key === "stockWarn"
                ? "STOCK_WARN"
                : key.toUpperCase();
            return `${dbKey} = ?`;
          })
          .join(", ");

        const values = Object.values(camposProducto);

        const query = `
            UPDATE PRODUCTOS SET 
                NOMBRE = COALESCE(?, NOMBRE),
                DESC_CORTA = COALESCE(?, DESC_CORTA),
                DESCRIPCION = COALESCE(?, DESCRIPCION),
                STOCK_WARN = COALESCE(?, STOCK_WARN),
                STOCK_TOTAL = ?
            WHERE ID_PRODUCTO = ?
        `;

        await conn.query(query, [
          prodData.nombre || null,
          prodData.descCorta || null,
          prodData.descripcion || null,
          prodData.stockWarn || null,
          stockTotalCalculado,
          idProd,
        ]);
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

export default new ProductosRepository();
