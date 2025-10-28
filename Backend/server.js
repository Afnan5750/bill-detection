import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import detectionRoutes from "./routes/detectionRoutes.js";
import tariffRoutes from "./routes/tariffRoutes.js";
import reasonRoutes from "./routes/reasonRoutes.js";
import billDetailsRoutes from "./routes/billDetailsRoutes.js";
import billHistRoutes from "./routes/billHistRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import db from "./db.js";

dotenv.config();
const app = express();

app.use(express.json());

app.use(cors());
app.use(bodyParser.json());
app.use("/api", detectionRoutes);
app.use("/api", tariffRoutes);
app.use("/api", reasonRoutes);
app.use("/api", billDetailsRoutes);
app.use("/api", billHistRoutes)
app.use("/api", authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
