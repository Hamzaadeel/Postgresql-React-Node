import { Router, Request, Response } from "express";
import { ChallengeController } from "../controllers/ChallengeController";
import passport from "passport";

const router = Router();

// All challenge routes should be protected
router.use(passport.authenticate("jwt", { session: false }));

// Get all challenges
router.get("/", async (req: Request, res: Response) => {
  await ChallengeController.getChallenges(req, res);
});

// Get challenges by circle
router.get("/circle/:circleId", async (req: Request, res: Response) => {
  await ChallengeController.getChallengesByCircle(req, res);
});

// Create a new challenge
router.post("/", async (req: Request, res: Response) => {
  await ChallengeController.createChallenge(req, res);
});

// Update a challenge
router.put("/:id", async (req: Request, res: Response) => {
  await ChallengeController.updateChallenge(req, res);
});

// Delete a challenge
router.delete("/:id", async (req: Request, res: Response) => {
  await ChallengeController.deleteChallenge(req, res);
});

export default router;
