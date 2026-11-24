
import mongoose from "mongoose";

const stockSchema = new mongoose.Schema(
  {
    symbol: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    companyName: {
      type: String,
      required: true,
      trim: true,
    },

    exchange: {
      type: String,
      enum: ["NSE", "BSE"],
      required: true,
    },

    instrumentKey: {
      type: String,
      default: undefined,
      trim: true,
    },

    // Latest price from the most recently fetched market data
    currentPrice: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Previous trading day's closing price
    lastDayTradedPrice: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Date to which the stored market price belongs
    priceDataDate: {
      type: Date,
      default: null,
    },

    // Actual time when our application updated the price
    priceUpdatedAt: {
      type: Date,
      default: null,
    },

    // Price source identification
    priceSource: {
      type: String,
      enum: ["TEJHQ", null],
      default: null,
    },

    dayTimeSeries: [
      {
        timestamp: Date,
        open: Number,
        high: Number,
        low: Number,
        close: Number,
        volume: Number,
      },
    ],

    tenMinTimeSeries: [
      {
        timestamp: Date,
        open: Number,
        high: Number,
        low: Number,
        close: Number,
        volume: Number,
      },
    ],
  },
  { timestamps: true }
);

const Stock = mongoose.model("Stock", stockSchema);

export default Stock;
