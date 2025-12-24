import { Router } from "express";
import {
  crearTienda,
  obtenerTiendas,
  obtenerTiendaPorID,
  editarTienda,
  eliminarTienda,
} from "../controllers/tiendaController";
import { validarToken } from "../middlewares/auth";
import { permitirRoles } from "../middlewares/roles";

const router = Router();

router.get("/", validarToken, permitirRoles(1, 4), obtenerTiendas);
router.get("/:id", validarToken, obtenerTiendaPorID);
router.post("/", validarToken, permitirRoles(1, 4), crearTienda);
router.put("/:id", validarToken, permitirRoles(1, 2, 4), editarTienda);
router.delete("/:id", validarToken, permitirRoles(1, 4), eliminarTienda);

export default router;
