import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import usuarioRepository from "../repositories/usuarioRepository";
import { RequestUsuario } from "../middlewares/auth";

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
  req: Request,
  res: Response,
): Promise<void> => {
  const { nombre, apellido1, apellido2, email, pass, idRol, credito } =
    req.body;

  if (
    !nombre ||
    !apellido1 ||
    !email ||
    !pass ||
    !idRol ||
    credito === undefined
  ) {
    res.status(400).json({ message: "Faltan datos obligatorios" });
    return;
  }

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

  const { nombre, apellido_1, apellido_2, email, fotoPerfil } = req.body;

  try {
    const actualizarDatos: any = {};

    if (nombre) actualizarDatos.NOMBRE = nombre;
    if (apellido_1) actualizarDatos.APELLIDO_1 = apellido_1;
    if (apellido_2) actualizarDatos.APELLIDO_2 = apellido_2;
    if (email) actualizarDatos.EMAIL = email;
    if (fotoPerfil) actualizarDatos.FOTO_PERFIL = fotoPerfil;

    if (Object.keys(actualizarDatos).length === 0) {
      res.status(400).json({
        message: "No se enviaron datos válidos para la actualización",
      });
      return;
    }

    const exito = await usuarioRepository.update(userId, actualizarDatos);

    if (exito) {
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
  req: Request,
  res: Response,
): Promise<void> => {
  const { id } = req.params;
  const { nombre, apellido_1, apellido_2, email, idRol, idEstatus, credito } =
    req.body;

  if (!id || isNaN(Number(id))) {
    res.status(400).json({ message: "ID de usuario inválido" });
    return;
  }

  try {
    const actualizarDatos: any = {};

    if (nombre) actualizarDatos.NOMBRE = nombre;
    if (apellido_1) actualizarDatos.APELLIDO_1 = apellido_1;
    if (apellido_2) actualizarDatos.APELLIDO_2 = apellido_2;
    if (email) actualizarDatos.EMAIL = email;
    if (idRol) actualizarDatos.ID_ROL = idRol;
    if (idEstatus) actualizarDatos.ID_ESTATUS = idEstatus;
    if (credito !== undefined) {
      if (credito) actualizarDatos.CREDITO = credito;
    }

    if (Object.keys(actualizarDatos).length === 0) {
      res.status(400).json({ message: "No se enviaron datos para actualizar" });
      return;
    }

    const exito = await usuarioRepository.update(Number(id), actualizarDatos);

    if (exito) {
      res.json({
        message: "Usuario actualizado correctamente por el Administrador",
      });
    } else {
      res
        .status(404)
        .json({ message: "No se encontró el usuario para editar" });
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
