import express, { Request, Response } from "express";
import "reflect-metadata";
import cors from "cors";
import * as dotenv from "dotenv";

dotenv.config();

import path from "path";

import { AppDataSource } from "./database/data-source";
import routes from "./routes/routes";
import authRoutes from "./routes/auth.routes";
import fileRouter from "./controller/FileController"; 

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Servir archivos estáticos
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rutas
app.use("/auth", authRoutes);
app.use("/api", routes);
app.use("/files", fileRouter); 

app.get("/", (_req: Request, res: Response) => {
  res.send("Hello from the backend!");
});

AppDataSource.initialize()
  .then(() => {
    console.log("✅ Conectado a la base de datos");
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    });
  })
  .catch((error: unknown) => {
    if (error instanceof Error) {
      console.error("❌ Error al conectar la base de datos:", error.message);
    } else {
      console.error("❌ Error desconocido:", error);
    }
  });
