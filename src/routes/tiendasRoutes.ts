import { Router } from "express";
import { crearTienda } from "../controllers/tiendaController";
import { validarToken } from "../middlewares/auth";
import { permitirRoles } from "../middlewares/roles";

const router = Router();

router.get("/createShop", validarToken, permitirRoles(1,4), crearTienda);

export default router;