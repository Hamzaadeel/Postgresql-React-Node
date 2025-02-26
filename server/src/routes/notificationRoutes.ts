import { Router } from "express";
import { NotificationController } from "../controllers/NotificationController";
import passport from "passport";

const router = Router();

// All notification routes should be protected
router.use(passport.authenticate("jwt", { session: false }));

// Get user's notifications
router.get("/", async (req, res) => {
  await NotificationController.getUserNotifications(req, res);
});

// Mark notification as read
router.put("/:id/read", async (req, res) => {
  await NotificationController.markAsRead(req, res);
});

export default router;
