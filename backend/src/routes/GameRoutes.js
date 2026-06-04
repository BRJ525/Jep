import express from "express";
import { getGameMessage } from "../controllers/gameController.js";

const router = express.Router();

router.get("/", getGameMessage);

export default router;