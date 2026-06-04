import express from "express";
import { getRoomsMessage } from "../controllers/roomController.js";

const router = express.Router();

router.get("/", getRoomsMessage);

export default router;