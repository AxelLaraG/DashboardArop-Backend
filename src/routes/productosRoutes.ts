import { Router } from "express";
import {
  crearProducto,
  editarProductoCompleto,
  listarProductosPorTienda,
} from "../controllers/productosController";
import { validarToken } from "../middlewares/auth";
import { permitirRoles } from "../middlewares/roles";
import { validate } from "../middlewares/validate";
import {
  crearProductoSchema,
  editProducto,
  getProductosShop,
} from "../schemas/productoSchema";

const router = Router();

router.post(
  "/",
  validarToken,
  permitirRoles(1, 2),
  validate(crearProductoSchema),
  crearProducto
);

router.get(
  "/tienda/:shopId",
  validarToken,
  validate(getProductosShop),
  listarProductosPorTienda
);

router.put(
  "/:id",
  validarToken,
  permitirRoles(1, 2),
  validate(editProducto),
  editarProductoCompleto
);
export default router;
