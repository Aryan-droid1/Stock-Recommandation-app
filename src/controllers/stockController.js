import Stock from "../models/Stock.js";

export const createStock = async (req, res) => {
  try {
    const { symbol, companyName, exchange, instrumentKey } = req.body;

    const stock = await Stock.create({
      symbol,
      companyName,
      exchange,
      instrumentKey,
    });

    res.status(201).json({
      success: true,
      message: "Stock created successfully",
      data: stock,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllStocks = async (req, res) => {
  try {
    const stocks = await Stock.find();

    res.status(200).json({
      success: true,
      count: stocks.length,
      data: stocks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};