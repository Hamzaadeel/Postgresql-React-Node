import { Router, Request, Response } from "express";
import SubmissionsController from "../controllers/SubmissionsController";
import passport from "passport";

// Extend Request type to include user
interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
  };
}

const router = Router();

// Protect all submission routes
router.use(passport.authenticate("jwt", { session: false }));

// Create a new submission
router.post("/", async (req: AuthenticatedRequest, res: Response) => {
  await SubmissionsController.createSubmission(req, res);
});

export default router;
