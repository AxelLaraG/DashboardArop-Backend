import express, { Request, Response } from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import usuariosRoutes from "./routes/usuariosRoutes";
import tiendasRoutes from "./routes/tiendasRoutes";
import productosRoutes from "./routes/productosRoutes";

const app = express();
const PORT = process.env.PORT as string;

app.use(express.json());
app.use(cors());

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

app.use('/api/auth', authRoutes);
app.use('/api/users', usuariosRoutes);
app.use('/api/tiendas', tiendasRoutes);
app.use('/api/productos', productosRoutes);

app.use((req, res, next) => {
    res.status(404).json({ message: 'Ruta no encontrada' });
});
