
import axios from "axios";

const getTejHQStatus = async () => {
  const response = await axios.get(
    "https://api.tejhq.dev/v1/status",
    {
      timeout: 10000,
      headers: process.env.TEJHQ_API_KEY
        ? {
            Authorization: `Bearer ${process.env.TEJHQ_API_KEY}`,
          }
        : {},
    }
  );

  return response.data;
};

export const validateStockPrice = async (stock) => {
  if (!stock) {
    throw new Error("Stock not found");
  }

  if (
    !Number.isFinite(stock.currentPrice) ||
    stock.currentPrice <= 0
  ) {
    throw new Error("Invalid stock price");
  }

  if (stock.priceSource !== "TEJHQ") {
    throw new Error("Unverified stock price source");
  }

  if (!stock.priceDataDate || !stock.priceUpdatedAt) {
    throw new Error("Stock price metadata is missing");
  }

  const status = await getTejHQStatus();

  if (!status.trading_date) {
    throw new Error("Unable to verify latest market trading date");
  }

  const stockPriceDate = new Date(stock.priceDataDate)
    .toISOString()
    .slice(0, 10);

  if (stockPriceDate !== status.trading_date) {
    throw new Error(
      "Stock price is outdated. Refresh market data first."
    );
  }

  const updatedAt = new Date(stock.priceUpdatedAt).getTime();

  if (
    !Number.isFinite(updatedAt) ||
    updatedAt > Date.now() ||
    updatedAt <= 0
  ) {
    throw new Error("Invalid stock price metadata");
  }

  return {
    valid: true,
    priceSource: "TEJHQ",
    priceDataDate: status.trading_date,
    executionMode: "EOD",
  };
};
