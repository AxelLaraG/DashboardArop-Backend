import { Router } from "express";
import { crearTienda, editarTienda } from "../controllers/tiendaController";
import { validarToken } from "../middlewares/auth";
import { permitirRoles } from "../middlewares/roles";
import { validate } from "../middlewares/validate";
import { newShop, editShop } from "../schemas/tiendaSchema";

const router = Router();

router.post(
  "/",
  validarToken,
  permitirRoles(1, 4),
  validate(newShop),
  crearTienda,
);
router.put(
  "/:id",
  validarToken,
  permitirRoles(1, 2, 4),
  validate(editShop),
  editarTienda,
);

export default router;
