
import {
  executeBuyOrder,
  executeSellOrder,
} from "../services/tradeService.js";

const getErrorStatusCode = (message) => {
  const badRequestErrors = [
    "Insufficient virtual balance",
    "Insufficient shares",
    "Invalid quantity or price",
    "Stock price is outdated. Refresh market data first.",
    "Stock price has expired. Refresh market data first.",
    "Invalid stock price",
    "Unverified stock price source",
    "Stock price metadata is missing",
    "Invalid stock price metadata",
    "Unable to verify latest market trading date",
    "Stock price changed. Please retry the order.",
  ];

  if (badRequestErrors.includes(message)) {
    return 400;
  }

  if (message === "Stock not found") {
    return 404;
  }

  return 500;
};

export const buyStock = async (req, res) => {
  try {
    const { symbol, quantity } = req.body;

    if (
      !symbol ||
      !Number.isSafeInteger(quantity) ||
      quantity <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid symbol and quantity are required",
      });
    }

    const result = await executeBuyOrder({
      userId: req.user.userId,
      symbol: symbol.trim().toUpperCase(),
      quantity,
    });

    return res.status(201).json({
      success: true,
      message: "Paper BUY order executed successfully",
      data: result,
    });
  } catch (error) {
    console.error("BUY order error:", error.message);

    return res.status(getErrorStatusCode(error.message)).json({
      success: false,
      message: error.message,
    });
  }
};

export const sellStock = async (req, res) => {
  try {
    const { symbol, quantity } = req.body;

    if (
      !symbol ||
      !Number.isSafeInteger(quantity) ||
      quantity <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid symbol and quantity are required",
      });
    }

    const result = await executeSellOrder({
      userId: req.user.userId,
      symbol: symbol.trim().toUpperCase(),
      quantity,
    });

    return res.status(200).json({
      success: true,
      message: "Paper SELL order executed successfully",
      data: result,
    });
  } catch (error) {
    console.error("SELL order error:", error.message);

    return res.status(getErrorStatusCode(error.message)).json({
      success: false,
      message: error.message,
    });
  }
};
