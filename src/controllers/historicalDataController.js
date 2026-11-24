
import Stock from "../models/Stock.js";
import HistoricalCandle from "../models/HistoricalCandle.js";
import { getHistoricalData } from "../services/marketDataService.js";


export const syncHistoricalData = async (req, res) => {
  try {
    const { symbol } = req.params;

    const {
      exchange = "nse",
      from,
      to,
    } = req.query;

    if (!from || !to) {
      return res.status(400).json({
        success: false,
        message: "from and to dates are required",
      });
    }

    const normalizedSymbol = symbol.toUpperCase();
    const normalizedExchange = exchange.toUpperCase();

    if (!["NSE", "BSE"].includes(normalizedExchange)) {
      return res.status(400).json({
        success: false,
        message: "Exchange must be NSE or BSE",
      });
    }

    const stock = await Stock.findOne({
      symbol: normalizedSymbol,
      exchange: normalizedExchange,
    });

    if (!stock) {
      return res.status(404).json({
        success: false,
        message: "Stock not found. Create the stock first.",
      });
    }

    // Fetch historical data from TejHQ
    const response = await getHistoricalData(
      normalizedSymbol,
      normalizedExchange.toLowerCase(),
      from,
      to
    );

    const candles = Array.isArray(response)
      ? response
      : response?.data;

    if (!Array.isArray(candles)) {
      return res.status(502).json({
        success: false,
        message: "Invalid historical data format from TejHQ",
      });
    }

    if (candles.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No historical candles found",
        count: 0,
      });
    }

    // Prepare historical candle upserts
    const operations = candles.map((candle) => {
      const date = new Date(`${candle.date}T00:00:00.000Z`);

      return {
        updateOne: {
          filter: {
            stock: stock._id,
            date,
          },
          update: {
            $set: {
              stock: stock._id,
              symbol: stock.symbol,
              exchange: stock.exchange,
              date,
              open: candle.open,
              high: candle.high,
              low: candle.low,
              close: candle.close,
              volume: candle.volume ?? 0,
              turnover: candle.turnover ?? 0,
              trades: candle.trades ?? 0,
            },
          },
          upsert: true,
        },
      };
    });

    // Save historical candles
    const result = await HistoricalCandle.bulkWrite(
      operations,
      { ordered: false }
    );

    // Find the latest stored candle
    const latestCandle = await HistoricalCandle.findOne({
      stock: stock._id,
    })
      .sort({ date: -1 })
      .lean();

    // Update stock's latest stored closing price
    if (latestCandle) {
      stock.currentPrice = latestCandle.close;
      stock.lastDayTradedPrice = latestCandle.close;

      await stock.save();
    }

    return res.status(200).json({
      success: true,
      message: "Historical data synced successfully",
      symbol: normalizedSymbol,
      exchange: normalizedExchange,
      fetched: candles.length,
      inserted: result.upsertedCount,
      modified: result.modifiedCount,
      latestPrice: latestCandle?.close ?? null,
      latestPriceDate: latestCandle?.date ?? null,
    });

  } catch (error) {
    console.error("Historical sync error:", error.message);

    return res.status(500).json({
      success: false,
      message: error.response?.data?.detail || error.message,
    });
  }
};


export const getStoredHistoricalData = async (req, res) => {
  try {
    const { symbol } = req.params;
    const { from, to, exchange = "NSE" } = req.query;

    if (!from || !to) {
      return res.status(400).json({
        success: false,
        message: "from and to dates are required",
      });
    }

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
      date: {
        $gte: new Date(`${from}T00:00:00.000Z`),
        $lte: new Date(`${to}T23:59:59.999Z`),
      },
    })
      .sort({ date: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: candles.length,
      data: candles,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
