import { Router, Request, Response } from "express";
import { TenantController } from "../controllers/TenantController";
import passport from "passport";

const router = Router();

// All tenant routes should be protected
router.use(passport.authenticate("jwt", { session: false }));

// Get all tenants
router.get("/", async (req: Request, res: Response) => {
  await TenantController.getTenants(req, res);
});

// Create a new tenant
router.post("/", async (req: Request, res: Response) => {
  await TenantController.createTenant(req, res);
});

// Update a tenant
router.put("/:id", async (req: Request, res: Response) => {
  await TenantController.updateTenant(req, res);
});

// Delete a tenant
router.delete("/:id", async (req: Request, res: Response) => {
  await TenantController.deleteTenant(req, res);
});

export default router;
