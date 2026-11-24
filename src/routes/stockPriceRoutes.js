import express from "express";
import { refreshStockPrice } from "../controllers/stockPriceController.js";

const router = express.Router();

router.put("/:symbol", refreshStockPrice);

export default router;