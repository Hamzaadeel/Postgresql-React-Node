import { Router, Request, Response } from "express";
import { UserController } from "../controllers/UserController";
import passport from "passport";

const router = Router();

// Public routes
router.post("/login", async (req: Request, res: Response) => {
  await UserController.loginUser(req, res);
});

router.post("/", async (req: Request, res: Response) => {
  await UserController.createUser(req, res);
});

// Protected routes
router.use(passport.authenticate("jwt", { session: false }));

router.put("/profile-picture", async (req: Request, res: Response) => {
  console.log("Profile picture update route hit");
  await UserController.updateProfilePicture(req, res);
});

router.put("/:id/password", async (req: Request, res: Response) => {
  await UserController.updatePassword(req, res);
});

router.get("/", async (req: Request, res: Response) => {
  await UserController.getUsers(req, res);
});

router.put("/:id", async (req: Request, res: Response) => {
  await UserController.updateUser(req, res);
});

router.delete("/:id", async (req: Request, res: Response) => {
  await UserController.deleteUser(req, res);
});

export default router;
