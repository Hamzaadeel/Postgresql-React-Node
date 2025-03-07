import express from "express";
import cors from "cors";
import { AppDataSource } from "./data-source";
import userRoutes from "./routes/userRoutes";
import challengeParticipantsRoutes from "./routes/challengeParticipantsRoutes";
import searchRoutes from "./routes/search";

const app = express();

// CORS configuration
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/challenge-participants", challengeParticipantsRoutes);
app.use("/api/search", searchRoutes);

export default app;
