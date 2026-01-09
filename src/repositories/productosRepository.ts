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

      /*
       * Bloquear filas para evitar condiciones de carrera
       */
      const [currentProdRows] = await conn.query<Productos[]>(
        "SELECT * FROM PRODUCTOS WHERE ID_PRODUCTO = ? FOR UPDATE",
        [idProd]
      );

      const [currentVarRows] = await conn.query<Productos[]>(
        "SELECT * FROM VARIANTES_PRODUCTO WHERE ID_PRODUCTO = ? AND ID_ESTATUS = 1 FOR UPDATE",
        [idProd]
      );

      if (currentProdRows.length === 0 || currentVarRows.length === 0) {
        throw new Error("Producto no encontrado");
      }

      const currentProd = currentProdRows[0];

      let newStock = 0;
      const incomingIds: number[] = [];

      /*
       * Recorremos todas las variantes recibidas
       */
      for (const v of variantes) {
        newStock += v.stock;

        if (v.idVariante) {
          /*
           * Si tiene idVariante entonces es un update
           */
          incomingIds.push(v.idVariante);
          const original = currentVarRows.find(
            (currentVar) => currentVar.ID_VARIANTE === v.idVariante
          );

          if (original) {
            const updates: any = {};
            const cambios: string[] = [];

            if (v.idColor && v.idColor !== original.ID_COLOR) {
              updates.ID_COLOR = v.idColor;
              cambios.push("Color");
            }
            if (v.descuento && v.descuento !== original.DESCUENTO) {
              updates.DESCUENTO = v.descuento;
              cambios.push("Descuento");
            }
            if (v.precio && v.precio !== Number(original.PRECIO)) {
              updates.PRECIO = v.precio;
              cambios.push("Precio");
            }
            if ((v.foto || "") !== (original.FOTO || "")) {
              updates.FOTO = v.foto || "";
              cambios.push("Foto");
            }
            const indAlmacenBool = original.IND_ALMACEN === 1;
            if (v.indAlmacen && v.indAlmacen !== indAlmacenBool) {
              updates.IND_ALMACEN = v.indAlmacen ? 1 : 0;
              cambios.push("Almacen");
            }
            if (v.stock && v.stock !== original.STOCK) {
              updates.STOCK = v.stock;
              cambios.push("Stock");
            }
            if (v.stockWarn && v.stockWarn !== original.STOCK_WARN) {
              updates.STOCK_WARN = v.stockWarn;
              cambios.push("StockWarn");
            }

            if (Object.keys(updates).length > 0) {
              const setClause = Object.keys(updates)
                .map((key) => `${key} = ?`)
                .join(", ");
              const values = Object.values(updates);

              await conn.query(
                `UPDATE VARIANTES_PRODUCTOS SET ${setClause} WHERE ID_VARIANTE = ?`,
                [...values, v.idVariante]
              );
              console.log(
                `Variante ${v.idVariante} actualizada: ${cambios.join(", ")}`
              );
            }
          }
        } else {
          /*
           * Si no tiene idVariante entonces es un insert
           */
          const queryInsertVar = `
            INSERT INTO VARIANTES_PRODUCTOS 
            (ID_PRODUCTO, ID_COLOR, ID_ESTATUS, DESCUENTO, PRECIO, FOTO, IND_ALMACEN, STOCK, STOCK_WARN)
            VALUES (?, ?, 1, ?, ?, ?, ?, ?, ?)
          `;

          await conn.query(queryInsertVar, [
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

      const toDelete = currentVarRows
        .filter((cv) => !incomingIds.includes(cv.ID_VARIANTE))
        .map((cv) => cv.ID_VARIANTE);

      if (toDelete.length > 0) {
        await conn.query(
          `UPDATE VARIANTES_PRODUCTOS SET ID_ESTATUS = 4 WHERE ID_VARIANTE IN (?)`,
          [toDelete]
        );
      }

      /*
       * Se buscan modificaciones en los datos del producto
       */

      const prodUpdates: any = {};

      if (prodData.nombre && prodData.nombre !== currentProd?.NOMBRE) {
        prodUpdates.NOMBRE = prodData.nombre;
      }
      if (
        prodData.descCorta &&
        prodData.descCorta !== currentProd?.DESC_CORTA
      ) {
        prodUpdates.DESC_CORTA = prodData.descCorta;
      }
      if (
        prodData.descripcion &&
        prodData.descripcion !== currentProd?.DESCRIPCION
      ) {
        prodUpdates.DESCRIPCION = prodData.descripcion;
      }
      if (
        prodData.stockWarn !== undefined &&
        prodData.stockWarn !== currentProd?.STOCK_WARN
      ) {
        prodUpdates.STOCK_WARN = prodData.stockWarn;
      }
      if (newStock !== currentProd?.STOCK_TOTAL) {
        prodUpdates.STOCK_TOTAL = newStock;
      }

      if (Object.keys(prodUpdates).length > 0) {
        const setClause = Object.keys(prodUpdates)
          .map((key) => `${key} = ?`)
          .join(", ");
        const values = Object.values(prodUpdates);

        await conn.query(
          `UPDATE PRODUCTOS SET ${setClause} WHERE ID_PRODUCTO = ?`,
          [...values, prodUpdates]
        );
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

  async checkStock(id: number): Promise<number | null> {
    const query = "SELECT STOCK FROM VARIANTES_PRODUCTO WHERE ID_VARIANTE = ?";
    const [rows] = await db.query<RowDataPacket[]>(query, [id]);

    if (rows.length === 0) return null;
    return rows[0]?.STOCK;
  }

  async eliminarProducto(id: number): Promise<boolean> {
    let conn: PoolConnection | null = null;

    try {
      conn = await db.getConnection();
      await conn.beginTransaction();

      const [prod] = await conn.query<RowDataPacket[]>(
        "SELECT ID_PRODUCTO FROM PRODUCTOS WHERE ID_PRODUCTO = ? FOR UPDATE",
        [id]
      );

      if (prod.length === 0) {
        await conn.rollback();
        return false;
      }

      const queryBajaVariantes = `
        UPDATE VARIANTES_PRODUCTOS 
        SET ID_ESTATUS = 4 
        WHERE ID_PRODUCTO = ?
      `;

      const [res] = await conn.query<any>(queryBajaVariantes, [id]);

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
