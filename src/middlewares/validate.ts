import { Request, Response, NextFunction } from "express";
import { z, ZodError } from "zod";

export const validate =
  (schema: z.ZodType) => (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      next();
    } catch (e) {
      if (e instanceof ZodError) {
        return res.status(400).json({
          message: "Error de la valdiación",
          errors: e.issues.map((issue) => ({
            field: issue.path[1],
            message: issue.message,
          })),
        });
      }
      return res.status(500).json({ message: "Error interno del servidor"});
    }
  };
