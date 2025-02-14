import { Router, Request, Response } from "express";
import { CircleController } from "../controllers/CircleController";
import passport from "passport";

const router = Router();

// All circle routes should be protected
router.use(passport.authenticate("jwt", { session: false }));

// Get all circles
router.get("/", async (req: Request, res: Response) => {
  await CircleController.getCircles(req, res);
});

// Create a new circle
router.post("/", async (req: Request, res: Response) => {
  await CircleController.createCircle(req, res);
});

// Update a circle
router.put("/:id", async (req: Request, res: Response) => {
  await CircleController.updateCircle(req, res);
});

// Delete a circle
router.delete("/:id", async (req: Request, res: Response) => {
  await CircleController.deleteCircle(req, res);
});

export default router;
