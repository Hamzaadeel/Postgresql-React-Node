import { Router, Request, Response } from "express";
import { UserController } from "../controllers/UserController";

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

export default router;
