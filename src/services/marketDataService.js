
import axios from "axios";

const tejhq = axios.create({
  baseURL: "https://api.tejhq.dev/v1",
  timeout: 15000,
  headers: process.env.TEJHQ_API_KEY
    ? {
        Authorization: `Bearer ${process.env.TEJHQ_API_KEY}`,
      }
    : {},
});

// Fetch historical OHLCV data
export const getHistoricalData = async (
  symbol,
  exchange = "nse",
  from,
  to
) => {
  const response = await tejhq.get(
    `/ohlcv/${exchange}/${symbol}`,
    {
      params: { from, to },
    }
  );

  return response.data;
};

// Fetch market snapshot
export const getMarketSnapshot = async (exchange, date) => {
  const response = await tejhq.get(
    `/snapshot/${exchange}`,
    {
      params: date ? { date } : {},
    }
  );

  return response.data;
};

export const getStockFromSnapshot = async (
  symbol,
  exchange = "nse",
  date
) => {
  const snapshot = await getMarketSnapshot(exchange, date);

  const stocks = Array.isArray(snapshot)
    ? snapshot
    : snapshot.data;

  if (!Array.isArray(stocks)) {
    throw new Error("Invalid market snapshot response");
  }

  const stock = stocks.find(
    (item) =>
      item.symbol?.toUpperCase() === symbol.toUpperCase()
  );

  if (!stock) {
    throw new Error(`Stock ${symbol} not found in snapshot`);
  }

  return stock;
};
