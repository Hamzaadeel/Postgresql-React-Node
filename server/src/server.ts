import express from "express";
import cors from "cors";
import passport from "passport";
import { AppDataSource } from "./data-source";
import userRoutes from "./routes/userRoutes";
import tenantRoutes from "./routes/tenantRoutes";
import circleRoutes from "./routes/circleRoutes";
import challengeRoutes from "./routes/challengeRoutes";
import circleParticipantsRoutes from "./routes/circleParticipantsRoutes";
import challengeParticipantsRoutes from "./routes/challengeParticipantsRoutes";
import { passportConfig } from "./middleware/passport";

const app = express();
const PORT = process.env.PORT || 5000;

passportConfig(passport);
app.use(passport.initialize());

app.use(
  cors({
    origin: "http://localhost:5173", // Adjust to your frontend's URL
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.use(express.json());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/tenants", tenantRoutes);
app.use("/api/circles", circleRoutes);
app.use("/api/challenges", challengeRoutes);
app.use("/api/circle-participants", circleParticipantsRoutes);
app.use("/api/challenge-participants", challengeParticipantsRoutes);

// Define a route for the root path
app.get("/", (req, res) => {
  res.send("Welcome to the API!"); // You can customize this message
});

AppDataSource.initialize()
  .then(() => {
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((error) => console.log(error));

export default app;
