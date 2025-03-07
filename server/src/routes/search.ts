import express from "express";
import passport from "passport";
import { SearchController } from "../controllers/SearchController";

const router = express.Router();

router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  SearchController.globalSearch
);

export default router;
