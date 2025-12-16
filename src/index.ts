import express, { Request, Response } from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import usuariosRoutes from "./routes/usuariosRoutes";

const app = express();
const PORT = process.env.PORT as string;

app.use(express.json());
app.use(cors());

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuariosRoutes);

app.use((req, res, next) => {
    res.status(404).json({ message: 'Ruta no encontrada' });
});
