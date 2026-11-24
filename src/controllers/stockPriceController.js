import { updateStockPrice } from "../services/stockPriceService.js";

export const refreshStockPrice = async (req, res) => {
  try {
    const { symbol } = req.params;
    const { exchange = "nse", date } = req.query;

    if (!symbol) {
      return res.status(400).json({
        success: false,
        message: "Stock symbol is required",
      });
    }

    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Trading date is required",
      });
    }

    if (!["nse", "bse"].includes(exchange.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: "Exchange must be nse or bse",
      });
    }

    const result = await updateStockPrice(
      symbol,
      exchange,
      date
    );

    return res.status(200).json({
      success: true,
      message: "Stock price updated successfully",
      data: {
  symbol: result.stock.symbol,
  currentPrice: result.stock.currentPrice,
  lastDayTradedPrice: result.stock.lastDayTradedPrice,
  priceDataDate: result.stock.priceDataDate,
  priceUpdatedAt: result.stock.priceUpdatedAt,
  priceSource: result.stock.priceSource,
},
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};