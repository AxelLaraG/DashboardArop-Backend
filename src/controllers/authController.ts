import { Request, Response } from "express";
import db from "../config/db";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import usuarioRepository from "../repositories/usuarioRepository";
import { RequestUsuario } from "../middlewares/auth";

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, pass } = req.body;

  try {
    const usr = await usuarioRepository.findByEmail(email);

    if (!usr) {
      res
        .status(401)
        .json({ message: "Credenciales inválidas (Usuario no encontrado)" });
      return;
    }

    //Modo Pruebas
    // if (pass != usr.PASSWORD) {
    //   res.status(401).json({ message: "Contraseña incorrecta" });
    //   return;
    // }

    const passSuccess = await bcrypt.compare(pass, usr.PASSWORD);
    if(!passSuccess){
      res.status(401).json({message:'Contraseña incorrecta'});
      return;
    }
    

    if (usr.ID_ESTATUS === 3 || usr.ID_ESTATUS === 2 || usr.ID_ROL === 3) {
      res.status(401).json({
        message: "Usuario no permitido, por favor contacte un administrador",
      });
      return;
    }

    const token = jwt.sign(
      { id: usr.ID_USUARIO, role: usr.ID_ROL },
      process.env.JWT_SECRET as string,
      { expiresIn: "8h" },
    );

    res.json({
      message: "Login Exitoso",
      token,
      usuario: {
        nombre: usr.NOMBRE,
        apellido1: usr.APELLIDO_1,
        apellido2: usr.APELLIDO_2,
        credito: usr.CREDITO,
        email: usr.EMAIL,
        rol: usr.ID_ROL,
      },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Error en el servidor" });
  }
};

export const changePass = async (
  req: RequestUsuario,
  res: Response,
): Promise<void> => {
  const userId = req.user?.id;
  const { actualPass, newPass } = req.body;

  if (!userId) {
    res.status(401).json({ message: "Usuario no identificado" });
    return;
  }

  if (!actualPass || !newPass) {
    res.status(400).json({ message: "Faltan datos obligatorios" });
    return;
  }

  try {
    const usr = await usuarioRepository.findById(userId);

    if (!usr) {
      res.status(404).json({ message: "Usuario no encontrado" });
      return;
    }

    let esValida = false;

    if (usr.PASSWORD.startsWith("$2b$")) {
      esValida = await bcrypt.compare(actualPass, usr.PASSWORD);
    } else {
      esValida = actualPass === usr.PASSWORD;
    }

    if (!esValida) {
      res.status(400).json({ message: "La contraseña actual es incorrecta" });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const newPassEnc = await bcrypt.hash(newPass, salt);

    const updated = await usuarioRepository.updatePassword(userId, newPassEnc);

    if (updated) {
      res.json({ message: "Contraseña actualizada correctamente" });
    } else {
      res.status(500).json({ message: "No se puede actualizar la contraseña" });
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Error en el servidor" });
  }
};
