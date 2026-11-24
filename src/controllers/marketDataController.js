
import {
  getHistoricalData,
  getMarketSnapshot,
} from "../services/marketDataService.js";

export const fetchHistoricalData = async (req, res) => {
  try {
    const { symbol } = req.params;
    const { exchange = "nse", from, to } = req.query;

    if (!from || !to) {
      return res.status(400).json({
        success: false,
        message: "from and to dates are required",
      });
    }

    if (!["nse", "bse"].includes(exchange.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: "Exchange must be nse or bse",
      });
    }

    const data = await getHistoricalData(
      symbol,
      exchange,
      from,
      to
    );

    return res.status(200).json({
      success: true,
      data: data.data,
      meta: data.meta,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.response?.data?.detail || error.message,
    });
  }
};

export const fetchMarketSnapshot = async (req, res) => {
  try {
    const { exchange = "nse", date } = req.query;

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

    const data = await getMarketSnapshot(exchange, date);

    return res.status(200).json({
      success: true,
      data: data.data,
      meta: data.meta,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.response?.data?.detail || error.message,
    });
  }
};
