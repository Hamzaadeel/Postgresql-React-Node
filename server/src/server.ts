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
import pointsRoutes from "./routes/pointsRoutes";
import notificationRoutes from "./routes/notificationRoutes";
import imageRoutes from "./routes/imageRoutes";
import { passportConfig } from "./middleware/passport";
import { createServer } from "http";
import searchRoutes from "./routes/search";
import { Server } from "socket.io";
import submissionsRoutes from "./routes/submissionsRoutes";

// Define notification type
interface Notification {
  id: number;
  title: string;
  message: string;
  createdAt: Date;
  isRead?: boolean;
}

const app = express();
const PORT = process.env.PORT || 5000;

// Create HTTP Server
const server = createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: "http://13.218.202.231:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Store connected users
const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log(`🔌 A user connected: ${socket.id}`);

  socket.on("register", (userId) => {
    onlineUsers.set(userId, socket.id);
    console.log(`✅ User ${userId} registered with socket ${socket.id}`);
  });

  socket.on("disconnect", () => {
    onlineUsers.forEach((value, key) => {
      if (value === socket.id) {
        onlineUsers.delete(key);
      }
    });
    console.log(`❌ User disconnected: ${socket.id}`);
  });
});

// Function to send real-time notifications
export const sendNotification = (
  userId: string,
  notification: Notification
) => {
  const userSocketId = onlineUsers.get(userId);
  if (userSocketId) {
    io.to(userSocketId).emit("notification", notification);
    console.log(`📩 Sent notification to User ${userId}:`, notification);
  }
};

passportConfig(passport);
app.use(passport.initialize());

app.use(
  cors({
    origin: "http://13.218.202.231:5173",
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
app.use("/api/points", pointsRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/images", imageRoutes);
app.use("/api/submissions", submissionsRoutes);

// Define a route for the root path
app.get("/", (req, res) => {
  res.send("Welcome to the API!");
});

// Initialize Database and Start Server
AppDataSource.initialize()
  .then(() => {
    server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((error) => console.log(error));

export { io, server };
