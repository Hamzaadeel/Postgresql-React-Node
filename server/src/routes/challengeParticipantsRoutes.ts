import { Router, Request, Response } from "express";
import { ChallengeParticipantsController } from "../controllers/ChallengeParticipantsController";
import passport from "passport";

const router = Router();

// All routes should be protected
router.use(passport.authenticate("jwt", { session: false }));

// Get pending submissions
router.get("/pending", async (req: Request, res: Response) => {
  await ChallengeParticipantsController.getPendingSubmissions(req, res);
});

// Get participants by challenge
router.get("/challenge/:challengeId", async (req: Request, res: Response) => {
  await ChallengeParticipantsController.getParticipantsByChallenge(req, res);
});

// Get challenges by user
router.get("/user/:userId", async (req: Request, res: Response) => {
  await ChallengeParticipantsController.getParticipationsByUser(req, res);
});

// Get user's challenge status
router.get("/user/:userId/status", async (req: Request, res: Response) => {
  await ChallengeParticipantsController.getUserChallengeStatus(req, res);
});

// Add participant to challenge
router.post("/", async (req: Request, res: Response) => {
  await ChallengeParticipantsController.addParticipant(req, res);
});

// Update participant status
router.put("/:id", async (req: Request, res: Response) => {
  await ChallengeParticipantsController.updateParticipantStatus(req, res);
});

// Remove participant from challenge
router.delete("/:id", async (req: Request, res: Response) => {
  await ChallengeParticipantsController.removeParticipant(req, res);
});

// Approve submission
router.put("/submissions/:id/approve", async (req: Request, res: Response) => {
  await ChallengeParticipantsController.approveSubmission(req, res);
});

// Reject submission
router.put("/submissions/:id/reject", async (req: Request, res: Response) => {
  await ChallengeParticipantsController.rejectSubmission(req, res);
});

export default router;
