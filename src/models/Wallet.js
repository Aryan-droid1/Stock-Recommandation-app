
import mongoose from "mongoose";

const walletSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    initialBalance: {
      type: Number,
      required: true,
      min: 0,
      default: 100000,
    },

    availableBalance: {
      type: Number,
      required: true,
      min: 0,
      default: 100000,
    },

    investedAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalPortfolioValue: {
      type: Number,
      default: 100000,
      min: 0,
    },
  },
  { timestamps: true }
);

const Wallet = mongoose.model("Wallet", walletSchema);

export default Wallet;
