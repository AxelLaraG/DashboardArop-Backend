import { Router } from "express";
import {
  crearUsuario,
  editarMiPerfil,
  editarUsuarioAdmin,
  obtenerUsuariosPorRol,
  eliminarUsuario,
} from "../controllers/usuarioController";
import { validarToken } from "../middlewares/auth";
import { permitirRoles } from "../middlewares/roles";
import { validate } from "../middlewares/validate";
import {
  crearUsuarioSchema,
  getUsrByRole,
  editUsr,
  editUsrAdmin,
  deleteUsr,
} from "../schemas/usuarioSchema";

const router = Router();

// Rutas de administrador
router.get(
  "/",
  validarToken,
  permitirRoles(1, 4),
  validate(getUsrByRole),
  obtenerUsuariosPorRol,
);

router.post(
  "/",
  validarToken,
  permitirRoles(1, 4),
  validate(crearUsuarioSchema),
  crearUsuario,
);

router.put(
  "/:id",
  validarToken,
  permitirRoles(1, 4),
  validate(editUsrAdmin),
  editarUsuarioAdmin,
);

router.delete(
  "/:id",
  validarToken,
  permitirRoles(1, 4),
  validate(deleteUsr),
  eliminarUsuario,
);

//Rutas que solo necesitan token
router.patch("/me", validarToken, validate(editUsr), editarMiPerfil);

export default router;
