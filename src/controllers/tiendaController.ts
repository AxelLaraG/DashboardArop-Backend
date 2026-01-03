import { Response } from "express";
import { RequestUsuario } from "../middlewares/auth";
import { Tiendas, Direcciones, NewTienda, NewDireccion } from "../interfaces";
import tiendaRepository from "../repositories/tiendaRepository";
import auditoriasRepository from "../repositories/auditoriasRepository";
import direccionRepository from "../repositories/direccionRepository";

export const crearTienda = async (
  req: RequestUsuario,
  res: Response,
): Promise<void> => {
  const { shop, dir, ownId } = req.body;

  try {
    const newShop: NewTienda = {
      NOMBRE_LEGAL: shop.nombreLegal,
      NOMBRE_COMERCIAL: shop.nombreComercial,
      LOGO: shop.logo || null,
      DESCRIPCION: shop.descripcion,
      EMAIL: shop.email,
      TELEFONO: shop.telefono,
      CLABE_IBAN: shop.clabe,
      RFC: shop.rfc,
    };

    const newDir: NewDireccion = {
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
    };

    const idNewShop = await tiendaRepository.crearTiendaConTransaccion(
      newShop,
      newDir,
      ownId,
    );

    if (idNewShop) {
      await auditoriasRepository.setNewAuditoria({
        ID_USUARIO: req.user.id,
        TABLA: "TIENDAS",
        TRANSACCION: `CREATE_STORE (ID: ${idNewShop} - ${newShop.NOMBRE_COMERCIAL})`,
        USER_AGENT: req.get("User-Agent") || "Desconocido",
      });
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

export const editarTienda = async (
  req: RequestUsuario,
  res: Response,
): Promise<void> => {
  const { id } = req.params;
  const userId = req.user.id;
  const { shop, dir } = req.body;

  if (
    req.user.role === 2 &&
    !(await tiendaRepository.validateOwner(Number(userId), Number(id)))
  ) {
    res.status(403).json({ message: "No es dueño de esta tienda" });
    return;
  }

  try {
    const tienda = await tiendaRepository.findById(Number(id));
    const updateDir: Partial<Direcciones> = {};
    const cambiosDir: string[] = [];
    const updateShop: Partial<Tiendas> = {};
    const cambiosTienda: string[] = [];
    const actDir = await direccionRepository.findDirById(
      Number(tienda?.ID_DIRECCION),
    );

    if (!tienda) {
      res.status(404).json({ message: "Tienda no encontrada" });
      return;
    }

    if (shop) {
      if (shop.idEstatus && shop.idEstatus !== tienda.ID_ESTATUS) {
        updateShop.ID_ESTATUS = shop.idEstatus;
        cambiosTienda.push("ID_ESTATUS");
      }
      if (shop.nombreLegal && shop.nombreLegal !== tienda.NOMBRE_LEGAL) {
        updateShop.NOMBRE_LEGAL = shop.nombreLegal;
        cambiosTienda.push("NOMBRE_LEGAL");
      }
      if (
        shop.nombreComercial &&
        shop.nombreComercial !== tienda.NOMBRE_COMERCIAL
      ) {
        updateShop.NOMBRE_COMERCIAL = shop.nombreComercial;
        cambiosTienda.push("NOMBRE_COMERCIAL");
      }
      if (shop.logo && shop.logo !== tienda.LOGO) {
        updateShop.LOGO = shop.logo;
        cambiosTienda.push("LOGO");
      }
      if (shop.descripcion && shop.descripcion !== tienda.DESCRIPCION) {
        updateShop.DESCRIPCION = shop.descripcion;
        cambiosTienda.push("DESCRIPCION");
      }
      if (shop.email && shop.email !== tienda.EMAIL) {
        updateShop.EMAIL = shop.email;
        cambiosTienda.push("EMAIL");
      }
      if (shop.telefono && shop.telefono !== tienda.TELEFONO) {
        updateShop.TELEFONO = shop.telefono;
        cambiosTienda.push("TELEFONO");
      }
      if (shop.clabe && shop.clabe !== tienda.CLABE_IBAN) {
        updateShop.CLABE_IBAN = shop.clabe;
        cambiosTienda.push("CLABE_IBAN");
      }
      if (shop.rfc && shop.rfc !== tienda.RFC) {
        updateShop.RFC = shop.rfc;
        cambiosTienda.push("RFC");
      }
    }

    if (dir) {
      if (dir.direccion && dir.direccion !== actDir?.DIRECCION) {
        updateDir.DIRECCION = dir.direccion;
        cambiosDir.push("DIRECCION");
      }
      if (dir.cp && dir.cp !== actDir?.CP) {
        updateDir.CP = dir.cp;
        cambiosDir.push("CP");
      }
      if (dir.estado && dir.estado !== actDir?.ESTADO) {
        updateDir.ESTADO = dir.estado;
        cambiosDir.push("ESTADO");
      }
      if (dir.municipio && dir.municipio !== actDir?.MUNICIPIO) {
        updateDir.MUNICIPIO = dir.municipio;
        cambiosDir.push("MUNICIPIO");
      }
      if (dir.localidad && dir.localidad !== actDir?.LOCALIDAD) {
        updateDir.LOCALIDAD = dir.localidad;
        cambiosDir.push("LOCALIDAD");
      }
      if (dir.colonia && dir.colonia !== actDir?.COLONIA) {
        updateDir.COLONIA = dir.colonia;
        cambiosDir.push("COLONIA");
      }
      if (dir.noInterior && dir.noInterior !== actDir?.NO_INTERIOR) {
        updateDir.NO_INTERIOR = dir.noInterior;
        cambiosDir.push("NO_INTERIOR");
      }
      if (dir.indicaciones && dir.indicaciones !== actDir?.INDICACIONES) {
        updateDir.INDICACIONES = dir.indicaciones;
        cambiosDir.push("INDICACIONES");
      }
      if (dir.tipoDomicilio && dir.tipoDomicilio !== actDir?.TIPO_DOMICILIO) {
        updateDir.TIPO_DOMICILIO = dir.tipoDomicilio;
        cambiosDir.push("TIPO_DOMICILIO");
      }
      if (dir.telContacto && dir.telContacto !== actDir?.TEL_CONTACTO) {
        updateDir.TEL_CONTACTO = dir.telContacto;
        cambiosDir.push("TEL_CONTACTO");
      }
      if (
        dir.nombreContacto &&
        dir.nombreContacto !== actDir?.NOMBRE_CONTACTO
      ) {
        updateDir.NOMBRE_CONTACTO = dir.nombreContacto;
        cambiosDir.push("NOMBRE_CONTACTO");
      }
    }

    if (
      Object.keys(updateDir).length === 0 &&
      Object.keys(updateShop).length === 0
    ) {
      res.status(200).json({ message: "No se detectaron cambios" });
      return;
    }

    const exito = await tiendaRepository.actualizarTiendaConTransaccion(
      Number(id),
      updateShop,
      updateDir,
    );

    if (exito) {
      const cambios = [...cambiosTienda, ...cambiosDir].join(", ");

      await auditoriasRepository.setNewAuditoria({
        ID_USUARIO: userId,
        TABLA: "TIENDAS",
        TRANSACCION: `UPDATE_STORE (ID: ${id} - CAMBIOS: ${cambios})`,
        USER_AGENT: req.get("User-Agent") || "Desconocido",
      });

      res.json({ message: "Tienda actualizada correctamente" });
    } else {
      res.status(500).json({ message: "No se puede actualizar la tienda" });
    }
  } catch (e: any) {
    console.error(e);

    if (e.code === "ER_DUP_ENTRY") {
      res.status(400).json({
        message: "El RFC o EMAIL ya están registrados en otra tienda",
      });
      return;
    }

    res.status(500).json({ message: "Error interno al actualizar la tienda" });
  }
};
