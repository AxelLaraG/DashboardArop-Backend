import { z } from "zod";

export const authUsrSchema = z.object({
  body: z.object({
    email: z.email({ error: "Debe ser un formato de correo válido" }),
    pass: z.string({ error: "La contraseña es requerrida" }),
  }),
});

export const changePassSchema = z.object({
  body: z.object({
    actPass: z.string({ error: "La contraseña actual es requerida" }),
    newPass: z.string({ error: "La nueva contraseña es requerida" }).min(6, {
      error: "La nueva contraseña debe contener al menos 6 caracteres",
    }),
  }),
});

