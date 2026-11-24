
import express from "express";
import {
  getStockRecommendation,
} from "../controllers/recommendationController.js";

const router = express.Router();

router.get("/:symbol", getStockRecommendation);

export default router;
