
import mongoose from "mongoose";

const holdingSchema = new mongoose.Schema(
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

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    averageBuyPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    investedAmount: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { timestamps: true }
);

// One holding per user per stock
holdingSchema.index(
  { user: 1, stock: 1 },
  { unique: true }
);

const Holding = mongoose.model("Holding", holdingSchema);

export default Holding;
