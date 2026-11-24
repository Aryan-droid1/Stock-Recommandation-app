
import Stock from "../models/Stock.js";
import { getStockFromSnapshot } from "./marketDataService.js";

export const updateStockPrice = async (
  symbol,
  exchange = "nse",
  date
) => {
  const marketStock = await getStockFromSnapshot(
    symbol,
    exchange,
    date
  );

  const stock = await Stock.findOneAndUpdate(
    {
      symbol: symbol.toUpperCase(),
      exchange: exchange.toUpperCase(),
    },
    {
      $set: {
        currentPrice: marketStock.last,
        lastDayTradedPrice: marketStock.prev_close,
        priceDataDate: new Date(`${date}T00:00:00.000Z`),
        priceUpdatedAt: new Date(),
        priceSource: "TEJHQ",
      },
    },
    { new: true, runValidators: true }
  );

  if (!stock) {
    throw new Error(`Stock ${symbol} not found in database`);
  }

  return {
    stock,
    marketData: marketStock,
  };
};
