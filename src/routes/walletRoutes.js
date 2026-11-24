
import express from "express";

import authMiddleware from "../middlewares/authMiddleware.js";
import { getWallet } from "../controllers/walletController.js";

const router = express.Router();

// Protected wallet endpoint
router.get("/", authMiddleware, getWallet);

export default router;
