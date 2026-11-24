
import Wallet from "../models/Wallet.js";
import Holding from "../models/Holding.js";

export const getWallet = async (req, res) => {
  try {
    const userId = req.user.userId;

    const wallet = await Wallet.findOne({
      user: userId,
    })
      .populate("user", "name email")
      .lean();

    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: "Wallet not found",
      });
    }

    const holdings = await Holding.find({
      user: userId,
    })
      .populate("stock", "currentPrice")
      .lean();

    const totalCurrentValue = holdings.reduce(
      (total, holding) => {
        const currentPrice = holding.stock?.currentPrice ?? 0;
        return total + holding.quantity * currentPrice;
      },
      0
    );

    const totalPortfolioValue = Number(
      (wallet.availableBalance + totalCurrentValue).toFixed(2)
    );

    const totalInvested = Number(
      wallet.investedAmount.toFixed(2)
    );

    const profitLoss = Number(
      (totalCurrentValue - totalInvested).toFixed(2)
    );

    return res.status(200).json({
      success: true,
      data: {
        user: wallet.user,
        initialBalance: wallet.initialBalance,
        availableBalance: wallet.availableBalance,
        investedAmount: totalInvested,
        currentHoldingsValue: Number(totalCurrentValue.toFixed(2)),
        profitLoss,
        totalPortfolioValue,
      },
    });
  } catch (error) {
    console.error("Wallet error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch wallet",
    });
  }
};
