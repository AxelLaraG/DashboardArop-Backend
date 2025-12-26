import { z } from "zod";

export const crearUsuarioSchema = z.object({
  body: z.object({
    nombre: z
      .string({ error: "El nombre es requerido" })
      .min(2, { error: "El nombre debe tener al menos 2 caracteres" }),

    apellido1: z
      .string({ error: "El apellido es requerido" })
      .min(2, { error: "El apellido debe tener al menos 2 caracteres" }),

    apellido2: z.string().optional(),

    email: z.email({ error: "Debe ser un formato de correo válido" }),

    pass: z
      .string({ error: "La contraseña es requerida" })
      .min(6, { error: "La contraseña debe tener al menos 6 caracteres" }),

    idRol: z
      .number({ error: "El ID del rol es requerido" })
      .int({ error: "El rol debe ser un número entero" }),

    credito: z
      .number({ error: "El crédito es requerido" })
      .min(0, { error: "El crédito no puede ser negativo" }),
  }),
});

export const getUsrByRole = z.object({
  body: z.object({
    rolId: z.number({ error: "El ID del Rol es requerido" }).min(1),
  }),
});

export const editUsr = z.object({
  body: z.object({
    nombre: z
      .string()
      .min(2, { error: "El nuevo nombre debe contener al menos 2 caracteres" })
      .optional(),

    apellido1: z
      .string()
      .min(2, {
        error: "El nuevo apellido debe contener al menos 2 caracteres",
      })
      .optional(),

    apellido2: z
      .string()
      .min(2, {
        error: "El nuevo apellido debe contener al menos 2 caracteres",
      })
      .optional(),

    email: z.email({ error: "El nuevo correo debe ser válido" }).optional(),

    fotoPerfil: z
      .url({ error: "La foto de Perfil debe apuntar a una URL" })
      .optional(),
  }),
});

export const editUsrAdmin = z.object({
  body: z.object({
    nombre: z
      .string()
      .min(2, { error: "El nuevo nombre debe contener al menos 2 caracteres" })
      .optional(),

    apellido1: z
      .string()
      .min(2, {
        error: "El nuevo apellido debe contener al menos 2 caracteres",
      })
      .optional(),

    apellido2: z
      .string()
      .min(2, {
        error: "El nuevo apellido debe contener al menos 2 caracteres",
      })
      .optional(),

    email: z.email({ error: "El nuevo correo debe ser válido" }).optional(),

    idRol: z.number({ error: "El nuevo ID rol debe ser numérico" }).optional(),

    idEstatus: z
      .number({ error: "El nuevo ID estatus debe ser numérico" })
      .optional(),

    credito: z
      .number({ error: "El credito debe ser numérico" })
      .min(0, { error: "El nuevo crédito debe ser positivo" })
      .optional(),
  }),
  
  params: z.object({
    id: z.coerce
      .number({ error: "El ID debe ser un número" })
      .int({ error: "El ID debe ser un entero" })
      .positive({ error: "El ID debe ser positivo" }),
  }),
});

export const deleteUsr = z.object({
  params: z.object({
    id: z.coerce
      .number({ error: "El ID debe ser un número" })
      .int({ error: "El ID debe ser un entero" })
      .positive({ error: "El ID debe ser positivo" }),
  }),
});