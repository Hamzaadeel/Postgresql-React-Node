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

// Clear all notifications
router.delete("/clear-all", async (req, res) => {
  await NotificationController.clearAllNotifications(req, res);
});

// Mark all notifications as read
router.put("/mark-all-read", async (req, res) => {
  await NotificationController.markAllAsRead(req, res);
});

// Mark specific notification as read
router.put("/:id/read", async (req, res) => {
  await NotificationController.markAsRead(req, res);
});

// Delete a specific notification
router.delete("/:id", async (req, res) => {
  await NotificationController.deleteNotification(req, res);
});

export default router;
