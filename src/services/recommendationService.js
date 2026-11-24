
const generateRecommendation = (indicatorData) => {
  const { close, indicators } = indicatorData;

  const {
    sma20,
    sma50,
    ema9,
    ema21,
    ema200,
    rsi14,
    macd,
    averageVolume20,
  } = indicators;

  let score = 0;
  const signals = [];

  // 1. Short-term EMA alignment (15 points)
  if (ema9 > ema21) {
    score += 15;
    signals.push("Bullish EMA 9/21 alignment");
  } else {
    signals.push("Bearish EMA 9/21 alignment");
  }

  // 2. Long-term EMA 200 trend (15 points)
  if (ema200 !== null && ema200 !== undefined) {
    if (close > ema200) {
      score += 15;
      signals.push("Price above EMA 200 - bullish long-term trend");
    } else {
      signals.push("Price below EMA 200 - bearish long-term trend");
    }
  } else {
    signals.push("EMA 200 unavailable");
  }

  // 3. SMA trend (20 points)
  if (sma20 > sma50) {
    score += 20;
    signals.push("Positive SMA trend");
  } else {
    signals.push("Negative SMA trend");
  }

  // 4. RSI momentum (15 points)
  if (rsi14 >= 50 && rsi14 <= 70) {
    score += 15;
    signals.push("Healthy bullish RSI");
  } else if (rsi14 > 70) {
    signals.push("RSI overbought");
  } else {
    signals.push("Weak RSI momentum");
  }

  // 5. MACD momentum (20 points)
  if (macd && macd.histogram > 0) {
    score += 20;
    signals.push("Positive MACD momentum");
  } else {
    signals.push("Negative MACD momentum");
  }

  // 6. Price compared with SMA 20 (10 points)
  if (close > sma20) {
    score += 10;
    signals.push("Price above SMA 20");
  } else {
    signals.push("Price below SMA 20");
  }

  // 7. Volume confirmation (5 points)
  const latestVolume = indicators.latestVolume;

  if (
    latestVolume !== null &&
    latestVolume !== undefined &&
    averageVolume20 > 0 &&
    latestVolume > averageVolume20
  ) {
    score += 5;
    signals.push("Volume above 20-day average");
  } else {
    signals.push("No volume confirmation");
  }

  // RSI overbought penalty
  if (rsi14 > 70) {
    score -= 10;
  }

  score = Math.max(0, Math.min(score, 100));

  let recommendation;

  if (score >= 70) {
    recommendation = "BUY";
  } else if (score >= 40) {
    recommendation = "HOLD";
  } else {
    recommendation = "SELL";
  }

  return {
    score,
    recommendation,
    signals,
  };
};

export const calculateTradeLevels = (
  currentPrice,
  atr,
  recommendation
) => {
  if (!currentPrice || !atr || atr <= 0) {
    return null;
  }

  const riskDistance = atr * 1.5;
  const rewardDistance = atr * 3;

  if (recommendation === "BUY") {
    return {
      entryPrice: currentPrice,
      stopLoss: Number((currentPrice - riskDistance).toFixed(2)),
      target: Number((currentPrice + rewardDistance).toFixed(2)),
      riskRewardRatio: "1:2",
    };
  }

  if (recommendation === "SELL") {
    return {
      entryPrice: currentPrice,
      stopLoss: Number((currentPrice + riskDistance).toFixed(2)),
      target: Number((currentPrice - rewardDistance).toFixed(2)),
      riskRewardRatio: "1:2",
    };
  }

  return null;
};

export const calculatePositionSize = (
  accountBalance,
  riskPercent,
  tradeLevels
) => {
  if (
    !Number.isFinite(accountBalance) ||
    !Number.isFinite(riskPercent) ||
    accountBalance <= 0 ||
    riskPercent <= 0 ||
    riskPercent > 100 ||
    !tradeLevels
  ) {
    return null;
  }

  const { entryPrice, stopLoss } = tradeLevels;

  const riskPerShare = Math.abs(entryPrice - stopLoss);
  const riskAmount = accountBalance * (riskPercent / 100);

  if (riskPerShare <= 0 || entryPrice <= 0) {
    return null;
  }

  const quantityByRisk = Math.floor(riskAmount / riskPerShare);
  const quantityByCapital = Math.floor(accountBalance / entryPrice);

  const quantity = Math.min(
    quantityByRisk,
    quantityByCapital
  );

  if (quantity <= 0) {
    return {
      quantity: 0,
      message: "Insufficient capital for this risk setting",
    };
  }

  return {
    quantity,
    riskAmount: Number(riskAmount.toFixed(2)),
    riskPerShare: Number(riskPerShare.toFixed(2)),
    investmentAmount: Number((quantity * entryPrice).toFixed(2)),
    estimatedLossAtStopLoss: Number(
      (quantity * riskPerShare).toFixed(2)
    ),
  };
};

export default generateRecommendation;
