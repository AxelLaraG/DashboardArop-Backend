import { Response, NextFunction } from "express";
import { RequestUsuario } from "./auth";

export const permitirRoles = (...rolesPermitidos: number[]) => {
  return (req: RequestUsuario, res: Response, next: NextFunction) => {
    if (!req.user || !rolesPermitidos.includes(req.user.role)) {
      res.status(403).json({ message: "No tienes permisos" });
      return;
    }
    next();
  };
};
