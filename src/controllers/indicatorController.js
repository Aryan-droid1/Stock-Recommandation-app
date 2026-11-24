
import Stock from "../models/Stock.js";
import HistoricalCandle from "../models/HistoricalCandle.js";
import calculateIndicators from "../services/technicalIndicatorService.js";

export const getStockIndicators = async (req, res) => {
  try {
    const { symbol } = req.params;
    const { exchange = "NSE" } = req.query;

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

    const indicators = calculateIndicators(candles);

    return res.status(200).json({
      success: true,
      data: indicators,
    });
  } catch (error) {
    console.error("Indicator calculation error:", error.message);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
