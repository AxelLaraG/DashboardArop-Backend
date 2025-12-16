import { Router } from "express";
import { crearUsuario, obtenerUsuariosPorRol } from "../controllers/usuarioController"
import { validarToken } from "../middlewares/auth";
import { esAdmin } from "../middlewares/roles";

const router = Router();

router.get('/getUsrsByRole', validarToken, esAdmin, obtenerUsuariosPorRol);
router.post('/createUsr', validarToken, esAdmin, crearUsuario);

export default router;