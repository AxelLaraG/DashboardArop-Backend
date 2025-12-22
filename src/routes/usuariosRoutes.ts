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
router.get("/users", validarToken, permitirRoles(1, 4), obtenerUsuariosPorRol);
router.post("/users", validarToken, permitirRoles(1, 4), crearUsuario);
router.put("/users/:id", validarToken, permitirRoles(1, 4), editarUsuarioAdmin);
router.delete("/users/:id", validarToken, permitirRoles(1,4), eliminarUsuario);

//Rutas que solo necesitan token
router.patch("/users/me", validarToken, editarMiPerfil);


export default router;
