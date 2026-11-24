import express from "express";
import cors from "cors";
import stockRoutes from "./src/routes/stockRoutes.js";
import marketDataRoutes from "./src/routes/marketDataRoutes.js";
import indicatorRoutes from "./src/routes/indicatorRoutes.js";
import recommendationRoutes from "./src/routes/recommendationRoutes.js";
import authRoutes from "./src/routes/authRoutes.js";
import walletRoutes from "./src/routes/walletRoutes.js";
import tradeRoutes from "./src/routes/tradeRoutes.js";
import holdingRoutes from "./src/routes/holdingRoutes.js";
import portfolioRoutes from "./src/routes/portfolioRoutes.js";
import stockPriceRoutes from "./src/routes/stockPriceRoutes.js";


const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);

app.use("/api/market", marketDataRoutes);
app.use("/api/indicators", indicatorRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/holdings", holdingRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Stock Recommendation API is running",
    status: "success",
  });
});
app.use("/api/trades", tradeRoutes);
app.use("/api/stock-prices", stockPriceRoutes);

app.use("/api/stocks", stockRoutes);
app.use("/api/portfolio", portfolioRoutes);


export default app;