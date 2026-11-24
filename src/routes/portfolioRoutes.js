
import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import { getPortfolioSummary } from "../controllers/portfolioController.js";

const router = express.Router();

router.get("/summary", authMiddleware, getPortfolioSummary);

export default router;
