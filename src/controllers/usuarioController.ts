import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import usuarioRepository from "../repositories/usuarioRepository";
import { RequestUsuario } from "../middlewares/auth";
import auditoriasRepository from "../repositories/auditoriasRepository";

export const obtenerUsuariosPorRol = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { rolId } = req.body;

  try {
    const usuarios = await usuarioRepository.findAllByRole(Number(rolId));
    res.json(usuarios);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Error del servidor" });
  }
};

export const crearUsuario = async (
  req: RequestUsuario,
  res: Response,
): Promise<void> => {
  const { nombre, apellido1, apellido2, email, pass, idRol, credito } =
    req.body;

  const exists = await usuarioRepository.findByEmail(email);

  if (exists) {
    res.status(400).json({ message: "Correo ya registrado" });
    return;
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const passEncript = await bcrypt.hash(pass, salt);

    const nuevoId = await usuarioRepository.createUsr({
      NOMBRE: nombre,
      APELLIDO_1: apellido1,
      APELLIDO_2: apellido2,
      EMAIL: email,
      PASSWORD: passEncript,
      ID_ROL: idRol,
      CREDITO: credito,
    } as any);

    if (nuevoId) {
      await auditoriasRepository.setNewAuditoria({
        ID_USUARIO: req.user?.id,
        TABLA: "USUARIOS",
        TRANSACCION: `CREATE_USER (ID Nuevo: ${nuevoId})`,
        USER_AGENT: req.get("User-Agent") || "Desconocido",
      } as any);
    }

    res
      .status(201)
      .json({ message: "Usuario creado correctamente", id: nuevoId });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Error del servidor" });
  }
};

export const editarMiPerfil = async (
  req: RequestUsuario,
  res: Response,
): Promise<void> => {
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ message: "Usuario no identificado" });
    return;
  }

  const { nombre, apellido1, apellido2, email, fotoPerfil } = req.body;
  const usr = await usuarioRepository.findById(userId);

  try {
    const actualizarDatos: any = {};

    if (nombre && nombre !== usr?.NOMBRE) actualizarDatos.NOMBRE = nombre;
    if (apellido1 && apellido1 !== usr?.APELLIDO_2)
      actualizarDatos.APELLIDO_1 = apellido1;
    if (
      apellido2 &&
      apellido2 !== undefined &&
      apellido2 !== usr?.APELLIDO_2
    )
      actualizarDatos.APELLIDO_2 = apellido2;
    if (email && email !== usr?.EMAIL) actualizarDatos.EMAIL = email;
    if (fotoPerfil && fotoPerfil !== usr?.FOTO_PERFIL)
      actualizarDatos.FOTO_PERFIL = fotoPerfil;

    if (Object.keys(actualizarDatos).length === 0) {
      res.status(400).json({
        message: "No se enviaron datos válidos para la actualización",
      });
      return;
    }

    const exito = await usuarioRepository.update(userId, actualizarDatos);

    if (exito) {
      await auditoriasRepository.setNewAuditoria({
        ID_USUARIO: userId,
        TABLA: "USUARIOS",
        TRANSACCION: "UPDATE_OWN_PROFILE",
        USER_AGENT: req.get("User-Agent") || "Desconocido",
      } as any);
      res.json({ message: "Perfil actualizado correctamente" });
    } else {
      res.status(404).json({ message: "Usuario no encontrado" });
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Error del servidor" });
  }
};

export const editarUsuarioAdmin = async (
  req: RequestUsuario,
  res: Response,
): Promise<void> => {
  const { id } = req.params;
  const { nombre, apellido_1, apellido_2, email, idRol, idEstatus, credito } =
    req.body;

  try {
    const usr = await usuarioRepository.findById(Number(id));

    if (!usr) {
      res.status(404).json({ message: "Usuario no encontrado" });
      return;
    }

    const updateData: any = {};

    if (nombre && nombre !== usr.NOMBRE) {
      updateData.NOMBRE = nombre;
    }
    if (apellido_1 && apellido_1 !== usr.APELLIDO_1) {
      updateData.APELLIDO_1 = apellido_1;
    }
    if (apellido_2 !== undefined && apellido_2 !== usr.APELLIDO_2) {
      updateData.APELLIDO_2 = apellido_2;
    }
    if (email && email !== usr.EMAIL) {
      updateData.EMAIL = email;
    }
    if (idRol && idRol !== usr.ID_ROL) {
      updateData.ID_ROL = idRol;
    }
    if (idEstatus && idEstatus !== usr.ID_ESTATUS) {
      updateData.ID_ESTATUS = idEstatus;
    }
    if (credito !== undefined && credito !== usr.CREDITO) {
      updateData.CREDITO = credito;
    }

    if (Object.keys(updateData).length === 0) {
      res.status(200).json({ message: "No se detectaron cambios" });
      return;
    }

    const exito = await usuarioRepository.update(Number(id), updateData);

    if (exito) {
      const log = Object.keys(updateData).join(",");
      await auditoriasRepository.setNewAuditoria({
        ID_USUARIO: req.user.id,
        TABLA: "USUARIOS",
        TRANSACCION: `UPDATE_USR (ID: ${id} - CAMBIOS: ${log})`,
        USER_AGENT: req.get("USER-AGENT") || "DESCONOCIDO",
      } as any);

      res.json({ message: "Actualización exitosa", cambios: `${log}` });
    } else {
      res.status(500).json({ message: "No se pudo actualizar el usuario" });
    }
  } catch (e: any) {
    if (e.code === "ER_DUP_ENTRY") {
      res
        .status(400)
        .json({ message: "El email ya está registrado en otro usuario" });
      return;
    }

    console.error(e);
    res.status(500).json({ message: "Error interno al actualizar usuario" });
  }
};

export const eliminarUsuario = async (
  req: RequestUsuario,
  res: Response,
): Promise<void> => {
  const { id } = req.params;

  try {
    const usr = await usuarioRepository.findById(Number(id));

    if (!usr) {
      res.status(404).json({ message: "Usuario no encontrado" });
      return;
    }

    if (Number(id) === req.user.id) {
      res.status(400).json({ message: "No puedes eliminar tu propio usuario" });
      return;
    }

    const exito = await usuarioRepository.update(Number(id), {
      ID_ESTATUS: 2,
    } as any);

    if (exito) {
      await auditoriasRepository.setNewAuditoria({
        ID_USUARIO: req.user.id,
        TABLA: "USUARIOS",
        TRANSACCION: `DELETE_USR (ID: ${usr} - NAME: ${usr.NOMBRE} ${usr.APELLIDO_1} ${usr.APELLIDO_2})`,
        USER_AGENT: req.get("User-Agent") || "Desconocido",
      } as any);
    } else {
      res.status(500).json({ message: "No se pudo eliminar al usuario" });
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({message:'Error interno al eliminar el usuario'});
  }
};
