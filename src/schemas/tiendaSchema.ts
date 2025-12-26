import { z } from "zod";

export const newShop = z.object({
  body: z.object({
    shop: z.object({
      nombreLegal: z.string({ error: "El nombre legal es requerido" }).min(2, {
        error: "El nombre legal debe contener al menos 2 caracteres",
      }),

      nombreComercial: z
        .string({ error: "El nombre comercial es requerido" })
        .min(2, {
          error: "El nombre comercial debe contener al menos 2 caracteres",
        }),

      logo: z.url({ error: "El Logo debe ser un URL válido" }).optional(),

      descripcion: z.string({
        error: "La descripción de la tienda es requerida",
      }),

      email: z.string({ error: "El correo de la tienda es requerido" }),

      telefono: z.string({ error: "El teléfono de la tienda es requerido" }),

      clabe: z
        .string({ error: "La CLABE o IBAN de la tienda es necesaria" })
        .min(15, { error: "La CLABE o IBAN debe ser de almenos 15 caracteres" })
        .max(34, { error: "La CLABE o IBAN debe ser máximo de 34 caracteres" }),

      rfc: z
        .string({ error: "El EFC de la tienda es necesario" })
        .min(12, { error: "El RFC debe ser mínimo de 12 caracteres" })
        .max(13, { error: "El EFC debe ser de máximo 13 caracteres" }),
    }),
    dir: z.object({
      direccion: z.string(),

      cp: z.string({ error: "El Código Postal es requerido" }),

      estado: z.string({ error: "El Estado es requerido" }),

      municipio: z.string({ error: "El Municipio es requerido" }),

      localidad: z.string({ error: "La Localidad es requerida" }),

      colonia: z.string({ error: "La Colonia es requerida" }),

      noInterior: z.string({ error: "El Número Interior es requerido" }),

      indicaciones: z.string().optional(),

      tipoDomicilio: z.string({ error: "El tipo de domicilio es requerido" }),

      nombreContacto: z.string({ error: "El Nombre de Contacto es requerido" }),

      telContacto: z
        .string({ error: "El teléfono de contacto es requerido" })
        .min(12, { error: "El mínimo es de 12 caracteres" })
        .max(15, { error: "El máximo es de 15 caracteres" }),
    }),
    ownId: z.int({ error: "El ID del dueño es requerido" }),
  }),
});

export const editShop = z.object({
  params: z.object({
    id: z.int({ error: "El ID de la tienda es necesario" }),
  }),

  body: z.object({
    shop: z
      .object({
        idEstatus: z.int().optional(),

        nombreLegal: z
          .string()
          .min(2, {
            error: "El nombre legal debe contener al menos 2 caracteres",
          })
          .optional(),

        nombreComercial: z
          .string()
          .min(2, {
            error: "El nombre comercial debe contener al menos 2 caracteres",
          })
          .optional(),

        logo: z.url({ error: "El Logo debe ser un URL válido" }).optional(),

        descripcion: z.string().optional(),

        email: z.string().optional(),

        telefono: z.string().optional(),

        clabe: z
          .string()
          .min(15, {
            error: "La CLABE o IBAN debe ser de almenos 15 caracteres",
          })
          .max(34, {
            error: "La CLABE o IBAN debe ser máximo de 34 caracteres",
          })
          .optional(),

        rfc: z
          .string()
          .min(12, { error: "El RFC debe ser mínimo de 12 caracteres" })
          .max(13, { error: "El EFC debe ser de máximo 13 caracteres" })
          .optional(),
      })
      .optional(),

    dir: z
      .object({
        direccion: z.string().optional(),

        cp: z.string().optional(),

        estado: z.string().optional(),

        municipio: z.string().optional(),

        localidad: z.string().optional(),

        colonia: z.string().optional(),

        noInterior: z.string().optional(),

        indicaciones: z.string().optional(),

        tipoDomicilio: z.string().optional(),

        nombreContacto: z.string().optional(),

        telContacto: z
          .string()
          .min(12, { error: "El mínimo es de 12 caracteres" })
          .max(15, { error: "El máximo es de 15 caracteres" })
          .optional(),
      })
      .optional()
  }),
});
