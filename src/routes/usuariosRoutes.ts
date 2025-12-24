import { Router } from "express";
import {
  crearUsuario,
  editarMiPerfil,
  editarUsuarioAdmin,
  obtenerUsuariosPorRol,
  eliminarUsuario
} from "../controllers/usuarioController";
import { validarToken } from "../middlewares/auth";
import { permitirRoles } from "../middlewares/roles";

const router = Router();

// Rutas de administrador
router.get("/", validarToken, permitirRoles(1, 4), obtenerUsuariosPorRol);
router.post("/", validarToken, permitirRoles(1, 4), crearUsuario);
router.put("/:id", validarToken, permitirRoles(1, 4), editarUsuarioAdmin);
router.delete("/:id", validarToken, permitirRoles(1,4), eliminarUsuario);

//Rutas que solo necesitan token
router.patch("/me", validarToken, editarMiPerfil);

export default router;