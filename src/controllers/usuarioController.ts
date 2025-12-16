import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import usuarioRepository from "../repositories/usuarioRepository";

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
