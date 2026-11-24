
import mongoose from "mongoose";
import axios from "axios";

import Wallet from "../models/Wallet.js";
import Stock from "../models/Stock.js";
import Trade from "../models/Trade.js";
import Holding from "../models/Holding.js";

import { validateStockPrice } from "./priceValidationService.js";
import { updateStockPrice } from "./stockPriceService.js";

const getLatestTradingDate = async () => {
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

  if (!response.data?.trading_date) {
    throw new Error("Unable to verify latest market trading date");
  }

  return response.data.trading_date;
};

const refreshVerifiedPrice = async (symbol) => {
  const tradingDate = await getLatestTradingDate();

  const result = await updateStockPrice(
    symbol,
    "nse",
    tradingDate
  );

  return result.stock;
};

export const executeBuyOrder = async ({
  userId,
  symbol,
  quantity,
}) => {
  if (!Number.isSafeInteger(quantity) || quantity <= 0) {
    throw new Error("Invalid quantity");
  }

  await refreshVerifiedPrice(symbol);

  const session = await mongoose.startSession();

  try {
    let result;

    await session.withTransaction(async () => {
      const stock = await Stock.findOne({
        symbol: symbol.toUpperCase(),
        exchange: "NSE",
      }).session(session);

      if (!stock) throw new Error("Stock not found");

      const priceMetadata = await validateStockPrice(stock);
      const executionPrice = stock.currentPrice;

      const totalAmount = Number(
        (quantity * executionPrice).toFixed(2)
      );

      const wallet = await Wallet.findOne({
        user: userId,
      }).session(session);

      if (!wallet) throw new Error("Wallet not found");

      if (wallet.availableBalance < totalAmount) {
        throw new Error("Insufficient virtual balance");
      }

      wallet.availableBalance = Number(
        (wallet.availableBalance - totalAmount).toFixed(2)
      );

      wallet.investedAmount = Number(
        (wallet.investedAmount + totalAmount).toFixed(2)
      );

      wallet.totalPortfolioValue = Number(
        (wallet.availableBalance + wallet.investedAmount).toFixed(2)
      );

      await wallet.save({ session });

      const existingHolding = await Holding.findOne({
        user: userId,
        stock: stock._id,
      }).session(session);

      if (existingHolding) {
        const newQuantity = existingHolding.quantity + quantity;
        const newInvestedAmount =
          existingHolding.investedAmount + totalAmount;

        existingHolding.quantity = newQuantity;
        existingHolding.investedAmount = Number(
          newInvestedAmount.toFixed(2)
        );

        existingHolding.averageBuyPrice = Number(
          (newInvestedAmount / newQuantity).toFixed(2)
        );

        await existingHolding.save({ session });
      } else {
        await Holding.create(
          [{
            user: userId,
            stock: stock._id,
            symbol: stock.symbol,
            quantity,
            averageBuyPrice: executionPrice,
            investedAmount: totalAmount,
          }],
          { session }
        );
      }

      const [trade] = await Trade.create(
        [{
          user: userId,
          stock: stock._id,
          symbol: stock.symbol,
          type: "BUY",
          quantity,
          price: executionPrice,
          totalAmount,
          priceSource: priceMetadata.priceSource,
          priceDataDate: new Date(
            `${priceMetadata.priceDataDate}T00:00:00.000Z`
          ),
          executionMode: priceMetadata.executionMode,
          status: "EXECUTED",
        }],
        { session }
      );

      result = { trade, wallet };
    });

    return result;
  } finally {
    await session.endSession();
  }
};

export const executeSellOrder = async ({
  userId,
  symbol,
  quantity,
}) => {
  if (!Number.isSafeInteger(quantity) || quantity <= 0) {
    throw new Error("Invalid quantity");
  }

  await refreshVerifiedPrice(symbol);

  const session = await mongoose.startSession();

  try {
    let result;

    await session.withTransaction(async () => {
      const stock = await Stock.findOne({
        symbol: symbol.toUpperCase(),
        exchange: "NSE",
      }).session(session);

      if (!stock) throw new Error("Stock not found");

      const priceMetadata = await validateStockPrice(stock);
      const executionPrice = stock.currentPrice;

      const totalAmount = Number(
        (quantity * executionPrice).toFixed(2)
      );

      const holding = await Holding.findOne({
        user: userId,
        stock: stock._id,
      }).session(session);

      if (!holding || holding.quantity < quantity) {
        throw new Error("Insufficient shares");
      }

      const wallet = await Wallet.findOne({
        user: userId,
      }).session(session);

      if (!wallet) throw new Error("Wallet not found");

      const costBasis =
        quantity === holding.quantity
          ? holding.investedAmount
          : Number(
              (holding.averageBuyPrice * quantity).toFixed(2)
            );

      holding.quantity -= quantity;

      holding.investedAmount = Number(
        (holding.investedAmount - costBasis).toFixed(2)
      );

      if (holding.quantity === 0) {
        await Holding.deleteOne({
          _id: holding._id,
        }).session(session);
      } else {
        holding.averageBuyPrice = Number(
          (holding.investedAmount / holding.quantity).toFixed(2)
        );

        await holding.save({ session });
      }

      wallet.availableBalance = Number(
        (wallet.availableBalance + totalAmount).toFixed(2)
      );

      wallet.investedAmount = Number(
        (wallet.investedAmount - costBasis).toFixed(2)
      );

      wallet.totalPortfolioValue = Number(
        (wallet.availableBalance + wallet.investedAmount).toFixed(2)
      );

      await wallet.save({ session });

      const [trade] = await Trade.create(
        [{
          user: userId,
          stock: stock._id,
          symbol: stock.symbol,
          type: "SELL",
          quantity,
          price: executionPrice,
          totalAmount,
          priceSource: priceMetadata.priceSource,
          priceDataDate: new Date(
            `${priceMetadata.priceDataDate}T00:00:00.000Z`
          ),
          executionMode: priceMetadata.executionMode,
          status: "EXECUTED",
        }],
        { session }
      );

      result = { trade, wallet };
    });

    return result;
  } finally {
    await session.endSession();
  }
};
