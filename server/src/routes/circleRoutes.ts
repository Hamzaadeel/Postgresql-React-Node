import { Router, Request, Response } from "express";
import { CircleController } from "../controllers/CircleController";
import passport from "passport";

const router = Router();

// Protect all circle routes
router.use(passport.authenticate("jwt", { session: false }));

// Circle CRUD routes
router.get("/", async (req: Request, res: Response) => {
  await CircleController.getCircles(req, res);
});

router.post("/", async (req: Request, res: Response) => {
  await CircleController.createCircle(req, res);
});

router.put("/:id", async (req: Request, res: Response) => {
  await CircleController.updateCircle(req, res);
});

router.delete("/:id", async (req: Request, res: Response) => {
  await CircleController.deleteCircle(req, res);
});

// Circle images routes
router.get("/:id/images", async (req: Request, res: Response) => {
  await CircleController.getCircleImages(req, res);
});

router.post("/:id/images", async (req: Request, res: Response) => {
  await CircleController.addCircleImages(req, res);
});

router.delete("/images/:imageId", async (req: Request, res: Response) => {
  await CircleController.deleteCircleImage(req, res);
});

export default router;
