import express from "express";
import cors from "cors";
import { AppDataSource } from "./data-source";
import userRoutes from "./routes/userRoutes";

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
app.use(
  cors({
    origin: "http://localhost:5173", // Vite's default port
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());

// Routes
app.use("/api/users", userRoutes);

// Define a route for the root path
app.get("/", (req, res) => {
  res.send("Welcome to the API!"); // You can customize this message
});

AppDataSource.initialize()
  .then(() => {
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((error) => console.log(error));
