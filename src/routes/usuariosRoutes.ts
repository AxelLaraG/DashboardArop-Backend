import { Router } from "express";
import {
  crearUsuario,
  editarMiPerfil,
  editarUsuarioAdmin,
  obtenerUsuariosPorRol,
} from "../controllers/usuarioController";
import { validarToken } from "../middlewares/auth";
import { permitirRoles } from "../middlewares/roles";

const router = Router();

// Rutas de administrador
router.get(
  "/getUsrsByRole",
  validarToken,
  permitirRoles(1,4),
  obtenerUsuariosPorRol,
);
router.post("/createUsr", validarToken, permitirRoles(1,4), crearUsuario);
router.put("/:id", validarToken, permitirRoles(1,4), editarUsuarioAdmin);

//Rutas que solo necesitan token
router.put("/me", validarToken, editarMiPerfil);

export default router;
