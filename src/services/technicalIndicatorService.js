
import {
  SMA,
  EMA,
  RSI,
  MACD,
  BollingerBands,
  ATR
} from "technicalindicators";

const calculateIndicators = (candles) => {
  if (!Array.isArray(candles) || candles.length < 200) {
    throw new Error("At least 200 historical candles are required");
  }

  // Ensure chronological order
  const sortedCandles = [...candles].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  const closes = sortedCandles.map((c) => c.close);
  const volumes = sortedCandles.map((c) => c.volume ?? 0);
  const highs = sortedCandles.map((c) => c.high);
  const lows = sortedCandles.map((c) => c.low);

  const atr14 = ATR.calculate({
    high: highs,
    low: lows,
    close: closes,
    period: 14,
  });

  const sma20 = SMA.calculate({ period: 20, values: closes });
  const sma50 = SMA.calculate({ period: 50, values: closes });

  const ema9 = EMA.calculate({ period: 9, values: closes });
  const ema21 = EMA.calculate({ period: 21, values: closes });
  const ema200 = EMA.calculate({ period: 200, values: closes });

  const rsi14 = RSI.calculate({ period: 14, values: closes });

  const macd = MACD.calculate({
    values: closes,
    fastPeriod: 12,
    slowPeriod: 26,
    signalPeriod: 9,
    SimpleMAOscillator: false,
    SimpleMASignal: false,
  });

  const bollingerBands = BollingerBands.calculate({
    period: 20,
    values: closes,
    stdDev: 2,
  });

  const averageVolume20 = SMA.calculate({
    period: 20,
    values: volumes,
  });

  const last = (arr) => arr[arr.length - 1] ?? null;

  return {
    symbol: sortedCandles[0].symbol,
    date: sortedCandles[sortedCandles.length - 1].date,
    close: last(closes),

    indicators: {
      sma20: last(sma20),
      sma50: last(sma50),
      ema9: last(ema9),
      ema21: last(ema21),
      ema200: last(ema200),
      rsi14: last(rsi14),
      atr14: last(atr14),
      macd: last(macd),
      bollingerBands: last(bollingerBands),
      averageVolume20: last(averageVolume20),
      latestVolume: last(volumes),
    },
  };
};

export default calculateIndicators;
