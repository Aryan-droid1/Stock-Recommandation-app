
import express from "express";
import { getStockIndicators } from "../controllers/indicatorController.js";

const router = express.Router();

router.get("/:symbol", getStockIndicators);

export default router;
