
import mongoose from "mongoose";

const historicalCandleSchema = new mongoose.Schema(
  {
    stock: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Stock",
      required: true,
      index: true,
    },

    symbol: {
      type: String,
      required: true,
      uppercase: true,
      index: true,
    },

    exchange: {
      type: String,
      enum: ["NSE", "BSE"],
      required: true,
    },

    date: {
      type: Date,
      required: true,
    },

    open: {
      type: Number,
      required: true,
    },

    high: {
      type: Number,
      required: true,
    },

    low: {
      type: Number,
      required: true,
    },

    close: {
      type: Number,
      required: true,
    },

    volume: {
      type: Number,
      default: 0,
    },

    turnover: {
      type: Number,
      default: 0,
    },

    trades: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

historicalCandleSchema.index(
  { stock: 1, date: 1 },
  { unique: true }
);

const HistoricalCandle = mongoose.model(
  "HistoricalCandle",
  historicalCandleSchema
);

export default HistoricalCandle;
