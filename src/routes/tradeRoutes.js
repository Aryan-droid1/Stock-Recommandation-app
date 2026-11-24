
import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import {
  buyStock,
  sellStock,
} from "../controllers/tradeController.js";
import { getTradeHistory } from "../controllers/tradeHistoryController.js";

const router = express.Router();

router.post("/buy", authMiddleware, buyStock);
router.post("/sell", authMiddleware, sellStock);
router.get("/history", authMiddleware, getTradeHistory);

export default router;
