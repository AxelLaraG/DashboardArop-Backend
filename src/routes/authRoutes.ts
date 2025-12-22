import { Router } from "express";
import { changePass, login } from "../controllers/authController";
import { validarToken } from "../middlewares/auth";

const router = Router();

router.post("/login", login);
router.patch("/password", validarToken, changePass);

export default router;
