import { Router, Request, Response } from "express";
import S3Controller from "../controllers/S3Controller";
import passport from "passport";

const router = Router();

// Protect all image routes
router.use(passport.authenticate("jwt", { session: false }));

// Route to get pre-signed URL for upload
router.post("/upload-url", async (req: Request, res: Response) => {
  await S3Controller.getUploadUrl(req, res);
});

// Route to get pre-signed URL for viewing
router.get("/view-url", async (req: Request, res: Response) => {
  await S3Controller.getViewUrl(req, res);
});

// Route to get pre-signed URL for download
router.get("/download-url/:fileName", async (req: Request, res: Response) => {
  await S3Controller.getDownloadUrl(req, res);
});

// Route to delete a file
router.delete("/:fileName", async (req: Request, res: Response) => {
  await S3Controller.deleteFile(req, res);
});

export default router;
