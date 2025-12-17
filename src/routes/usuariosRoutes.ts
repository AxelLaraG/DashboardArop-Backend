import { Router } from "express";
import {
  crearUsuario,
  editarMiPerfil,
  obtenerUsuariosPorRol,
} from "../controllers/usuarioController";
import { validarToken } from "../middlewares/auth";
import { permitirRoles } from "../middlewares/roles";

const router = Router();

// Rutas de administrador
router.get(
  "/getUsrsByRole",
  validarToken,
  permitirRoles(1),
  obtenerUsuariosPorRol,
);
router.post("/createUsr", validarToken, permitirRoles(1), crearUsuario);

//Rutas que solo necesitan token
router.put("/me", validarToken, editarMiPerfil);

export default router;
