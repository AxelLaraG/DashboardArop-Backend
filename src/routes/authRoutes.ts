import { Router } from "express";
import { changePass, login } from "../controllers/authController";
import { validarToken } from "../middlewares/auth";

const router = Router();

router.post('/login', login);
router.post('/changePass',validarToken,changePass);

export default router;