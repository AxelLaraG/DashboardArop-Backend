import { Router } from "express";
import { crearUsuario, obtenerUsuariosPorRol } from "../controllers/usuarioController"
import { validarToken } from "../middlewares/auth";
import { permitirRoles } from "../middlewares/roles";

const router = Router();

router.get('/getUsrsByRole', validarToken, permitirRoles(1), obtenerUsuariosPorRol);
router.post('/createUsr', validarToken, permitirRoles(1), crearUsuario);

export default router;