import { Response, NextFunction } from "express";
import { RequestUsuario } from "./auth";

export const esAdmin = (
  req: RequestUsuario,
  res: Response,
  next: NextFunction,
): void => {
  if (!req.user) {
    res.status(500).json({ message: "Error de servidor: Rol sin token" });
    return;
  }

  const { role } = req.user;

  if (role !== 1) {
    res.status(403).json({ message: "Acceso denegado" });
    return;
  }
  
  next();
};
