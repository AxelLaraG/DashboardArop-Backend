import { Router } from "express";
import { changePass, login } from "../controllers/authController";
import { validarToken } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import { authUsrSchema, changePassSchema } from "../schemas/authSchema";

const router = Router();

router.post("/login", validate(authUsrSchema), login);
router.patch("/password",validarToken,validate(changePassSchema), changePass);

export default router;
