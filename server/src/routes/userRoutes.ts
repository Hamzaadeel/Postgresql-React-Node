import { Router, Request, Response } from "express";
import { UserController } from "../controllers/UserController";
import passport from "passport";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  await UserController.getUsers(req, res);
});

router.post("/", async (req: Request, res: Response) => {
  await UserController.createUser(req, res);
});

router.post("/login", async (req: Request, res: Response) => {
  await UserController.loginUser(req, res);
});

router.get(
  "/protected",
  passport.authenticate("jwt", { session: false }),
  (req: Request, res: Response) => {
    res.json({ message: "You are authenticated!" });
  }
);

export default router;
