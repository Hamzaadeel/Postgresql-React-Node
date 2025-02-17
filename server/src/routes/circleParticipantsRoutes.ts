import { Router, Request, Response } from "express";
import { CircleParticipantsController } from "../controllers/CircleParticipantsController";
import passport from "passport";

const router = Router();

// All routes should be protected
router.use(passport.authenticate("jwt", { session: false }));

// Get participants by circle
router.get("/circle/:circleId", async (req: Request, res: Response) => {
  await CircleParticipantsController.getParticipantsByCircle(req, res);
});

// Get circles by user
router.get("/user/:userId", async (req: Request, res: Response) => {
  await CircleParticipantsController.getParticipationsByUser(req, res);
});

// Add participant to circle
router.post("/", async (req: Request, res: Response) => {
  await CircleParticipantsController.addParticipant(req, res);
});

// Remove participant from circle
router.delete("/:id", async (req: Request, res: Response) => {
  await CircleParticipantsController.removeParticipant(req, res);
});

export default router;
