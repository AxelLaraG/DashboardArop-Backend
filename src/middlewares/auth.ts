import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface RequestUsuario extends Request {
  user?: any;
}

export const validarToken = (
  req: RequestUsuario,
  res: Response,
  next: NextFunction,
): void => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    res.status(403).json({ message: "Acceso Denegado" });
    return;
  }

  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : authHeader;

  if (!token) {
    res.status(403).json({ message: "Acceso Denegado. Token inválido" });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    req.user = decoded;
    next();
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Error en el servidor" });
  }
};
