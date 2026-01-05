import { z } from "zod";

const varianteSchema = z.object({
  idColor: z.number().int().positive({ error: "El ID del color es necesario" }),
  descuento: z.number().min(0).max(100).default(0),
  precio: z.number().positive({ error: "El precio es necesario" }),
  foto: z.url({ error: "Debe ser una URL válida" }).optional(),
  indAlmacen: z.boolean().default(true),
  stock: z.number().int().min(0, { error: "El stock no puede ser negativo" }),
  stockWarn: z.number().int().default(5),
});

export const crearProductoSchema = z.object({
  body: z.object({
    idTienda: z.number().int().positive(),
    producto: z.object({
      nombre: z.string().min(3, "El nombre debe tener al menos 3 letras"),
      descCorta: z.string().max(100, "La descripción corta es muy larga"),
      descripcion: z.string().optional(),
      stockWarn: z.number().int().min(0).default(5),
    }),
    variantes: z
      .array(varianteSchema)
      .min(1, "Debes agregar al menos una variante al producto"),
  }),
});

export const getProductosShop = z.object({
  params: z.object({
    shopId: z.coerce.number().int().positive(),
  }),
});

export const editProducto = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
  body: z.object({
    nombre: z.string().min(3).optional(),
    descCorta: z.string().max(100).optional(),
    descripcion: z.string().optional(),
    stockWarn: z.number().int().min(0).optional(),
  }),
});

export const editarVarianteSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
  body: z.object({
    idEstatus: z.number().int().optional(),
    descuento: z.number().min(0).max(100).optional(),
    precio: z.number().positive().optional(),
    foto: z.url().optional(),
    indAlmacen: z.boolean().optional(),
    stock: z.number().int().min(0).optional(),
    stockWarn: z.number().int().min(0).optional(),
  }),
});
