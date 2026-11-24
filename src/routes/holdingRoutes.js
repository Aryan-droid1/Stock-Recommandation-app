
import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import { getMyHoldings } from "../controllers/holdingController.js";

const router = express.Router();

router.get("/", authMiddleware, getMyHoldings);

export default router;
