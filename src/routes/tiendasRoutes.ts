import { Router } from "express";
import { crearTienda } from "../controllers/tiendaController";
import { validarToken } from "../middlewares/auth";
import { permitirRoles } from "../middlewares/roles";

const router = Router();

router.get("/shops", validarToken, permitirRoles(1, 4), obtenerTiendas);
router.get("/shops/:id", validarToken, obtenerTiendaPorID);
router.post("/shops", validarToken, permitirRoles(1, 4), crearTienda);
router.put("/shops/:id", validarToken, permitirRoles(1, 4), actualizarTienda);
router.delete("/shops/:id", validarToken, permitirRoles(1, 4), eliminarTienda);

export default router;
