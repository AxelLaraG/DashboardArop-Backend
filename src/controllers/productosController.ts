import { Response } from "express";
import { RequestUsuario } from "../middlewares/auth";
import { NewProducto, NewVarianteProducto } from "../interfaces";
import productosRepository from "../repositories/productosRepository";
import tiendaRepository from "../repositories/tiendaRepository";
import auditoriasRepository from "../repositories/auditoriasRepository";

export const crearProducto = async (
  req: RequestUsuario,
  res: Response,
): Promise<void> => {
  const userId = req.user.id;
  const { idTienda, producto, variantes } = req.body;

  try {
    if (req.user.role === 2) {
      const esDueno = await tiendaRepository.validateOwner(userId, idTienda);
      if (!esDueno) {
        res.status(403).json({ message: "No tienes permiso en esta tienda" });
        return;
      }
    }

    const totalStock = variantes.reduce(
      (acc: number, curr: any) => acc + curr.stock,
      0,
    );

    const newProd: NewProducto = {
      ID_TIENDA: idTienda,
      NOMBRE: producto.nombre,
      DESC_CORTA: producto.descCorta,
      DESCRIPCION: producto.descripcion || "",
      STOCK_TOTAL: totalStock,
      STOCK_WARN: producto.stockWarn,
    };

    const newVar: NewVarianteProducto[] = variantes.map((v: any) => ({
      ID_COLOR: v.idColor,
      DESCUENTO: v.descuento,
      PRECIO: v.precio,
      FOTO: v.foto || "",
      IND_ALMACEN: v.indAlmacen,
      STOCK: v.stock,
      STOCK_WARN: v.stockWarn,
    }));

    const idProd = await productosRepository.crearProductoConVariantes(
      newProd,
      newVar,
    );

    if (idProd) {
      await auditoriasRepository.setNewAuditoria({
        ID_USUARIO: userId,
        TABLA: "PRODUCTOS",
        TRANSACCION: `CREATE_PRODUCT (ID: ${idProd} - ${newProd.NOMBRE})`,
        USER_AGENT: req.get("User-Agent") || "Desconocido",
      });
    }

    res.status(201).json({ message: "Producto creado", id: idProd });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Error al crear producto" });
  }
};

export const listarProductosPorTienda = async (req: RequestUsuario, res: Response): Promise<void> => {
  const { shopId } = req.params;

  try {
    const productos = await productosRepository.getProductoPorTienda(Number(shopId));
    res.json(productos);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Error al obtener productos" });
  }
};

export const editProducto = async (req: RequestUsuario, res: Response): Promise<void> => { 
  const userId = req.user.id;
  const { prod, var } = req.body;
}