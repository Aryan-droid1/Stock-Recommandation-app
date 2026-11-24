
import express from "express";

import {
  fetchHistoricalData,
  fetchMarketSnapshot,
} from "../controllers/marketDataController.js";

import {
  syncHistoricalData,
  getStoredHistoricalData,
} from "../controllers/historicalDataController.js";

const router = express.Router();

// Fetch historical data directly from TejHQ
router.get("/history/:symbol/fetch", fetchHistoricalData);

// Sync TejHQ historical data into MongoDB
router.post("/history/:symbol/sync", syncHistoricalData);

// Read historical data from MongoDB
router.get("/history/:symbol", getStoredHistoricalData);

// Market snapshot
router.get("/snapshot", fetchMarketSnapshot);

export default router;
