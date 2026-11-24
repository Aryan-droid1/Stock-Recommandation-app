
import Stock from "../models/Stock.js";
import HistoricalCandle from "../models/HistoricalCandle.js";

import calculateIndicators from "../services/technicalIndicatorService.js";

import generateRecommendation, {
  calculateTradeLevels,
  calculatePositionSize,
} from "../services/recommendationService.js";

export const getStockRecommendation = async (req, res) => {
  try {
    const { symbol } = req.params;

    const {
      exchange = "NSE",
      accountBalance,
      riskPercent = "1",
    } = req.query;

    // Find stock
    const stock = await Stock.findOne({
      symbol: symbol.toUpperCase(),
      exchange: exchange.toUpperCase(),
    });

    if (!stock) {
      return res.status(404).json({
        success: false,
        message: "Stock not found",
      });
    }

    // Fetch historical candles
    const candles = await HistoricalCandle.find({
      stock: stock._id,
    })
      .sort({ date: 1 })
      .lean();

    if (candles.length < 50) {
      return res.status(400).json({
        success: false,
        message: "At least 50 historical candles are required",
      });
    }

    // Calculate technical indicators
    const indicatorData = calculateIndicators(candles);

    // Generate recommendation
    const recommendation = generateRecommendation(indicatorData);

    // Calculate stop-loss and target
    const tradeLevels = calculateTradeLevels(
      indicatorData.close,
      indicatorData.indicators.atr14,
      recommendation.recommendation
    );

    // Validate position sizing inputs
    let positionSize = null;

    if (accountBalance !== undefined) {
      const balance = Number(accountBalance);
      const risk = Number(riskPercent);

      if (
        !Number.isFinite(balance) ||
        balance <= 0 ||
        !Number.isFinite(risk) ||
        risk <= 0 ||
        risk > 100
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid accountBalance or riskPercent",
        });
      }

      if (recommendation.recommendation === "BUY") {
        positionSize = calculatePositionSize(
          balance,
          risk,
          tradeLevels
        );
      }
    }

    // Final API response
    return res.status(200).json({
      success: true,
      data: {
        symbol: stock.symbol,
        companyName: stock.companyName,
        exchange: stock.exchange,
        date: indicatorData.date,
        currentPrice: indicatorData.close,
        recommendation: recommendation.recommendation,
        score: recommendation.score,
        signals: recommendation.signals,
        indicators: indicatorData.indicators,
        tradeLevels,
        positionSize,
      },
    });
  } catch (error) {
    console.error("Recommendation error:", error.message);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
