import { Response } from "express";
import { RequestUsuario } from "../middlewares/auth";
import { Tiendas, Direcciones } from "../interfaces";
import tiendaRepository from "../repositories/tiendaRepository";
import auditoriasRepository from "../repositories/auditoriasRepository";

export const crearTienda = async (
  req: RequestUsuario,
  res: Response,
): Promise<void> => {
  const userId = req.user.id;
  const { shop, dir } = req.body;

  if (!userId) {
    res.status(401).json({ message: "Usuario no identificado" });
    return;
  }

  if (!shop || !dir) {
    res
      .status(400)
      .json({ message: "Faltan datos de la tienda o la dirección" });
    return;
  }

  if (!shop.nombreLegal || !shop.rfc || !shop.calle || !shop.cp) {
    res.status(400).json({ message: "Faltan datos importantes" });
    return;
  }

  try {
    const newShop: Partial<Tiendas> = {
      NOMBRE_LEGAL: shop.nombreLegal,
      NOMBRE_COMERCIAL: shop.nombreComercial,
      LOGO: shop.logo || null,
      DESCRIPCION: shop.descripcion,
      EMAIL: shop.email,
      TELEFONO: shop.telefono,
      CLABE_IBAN: shop.clabe,
      RFC: shop.rfc,
    } as any;

    const newDir: Partial<Direcciones> = {
      DIRECCION: dir.direccion,
      CP: dir.cp,
      ESTADO: dir.estado,
      MUNICIPIO: dir.municipio,
      LOCALIDAD: dir.localidad,
      COLONIA: dir.colonia,
      NO_INTERIOR: dir.noInterior || "",
      INDICACIONES: dir.indicaciones || "",
      TIPO_DOMICILIO: dir.tipoDomicilio,
      NOMBRE_CONTACTO: dir.nombreContacto,
      TEL_CONTACTO: dir.telContacto,
    } as any;

    const idNewShop = await tiendaRepository.crearTiendaConTransaccion(
      newShop,
      newDir,
      userId,
    );

    if (idNewShop) {
      await auditoriasRepository.setNewAuditoria({
        ID_USUARIO: userId,
        TABLA: "TIENDAS",
        TRANSACCION: `CREATE_STORE (ID: ${idNewShop} - ${newShop.NOMBRE_COMERCIAL})`,
        USER_AGENT: req.get("User-Agent") || "Desconocido",
      } as any);
    }

    res
      .status(200)
      .json({ message: "Tienda creada exitosamente", id: idNewShop });
  } catch (e: any) {
    console.error(e);

    if (e.code === "ER_DUP_ENTRY") {
      res
        .status(400)
        .json({ message: "El RFC o datos únicos ya están registrados." });
      return;
    }

    res.status(500).json({ message: "Error interno al crear la tienda" });
  }
};
