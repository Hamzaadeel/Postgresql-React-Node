import { Router } from "express";
import { PointsController } from "../controllers/PointsController";
import passport from "passport";

const router = Router();

// Protect all points routes
router.use(passport.authenticate("jwt", { session: false }));

// Get user's total points
router.get("/:userId", PointsController.getTotalPoints);

// Get leaderboard
router.get("/leaderboard/top", PointsController.getLeaderboard);

export default router;
