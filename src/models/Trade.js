
import mongoose from "mongoose";

const tradeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    stock: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Stock",
      required: true,
    },

    symbol: {
      type: String,
      required: true,
      uppercase: true,
    },

    type: {
      type: String,
      enum: ["BUY", "SELL"],
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    priceSource: {
      type: String,
      enum: ["TEJHQ"],
      required: true,
    },

    priceDataDate: {
      type: Date,
      required: true,
    },

    executionMode: {
      type: String,
      enum: ["EOD"],
      required: true,
    },

    status: {
      type: String,
      enum: ["EXECUTED", "CANCELLED"],
      default: "EXECUTED",
    },
  },
  { timestamps: true }
);

const Trade = mongoose.model("Trade", tradeSchema);

export default Trade;
