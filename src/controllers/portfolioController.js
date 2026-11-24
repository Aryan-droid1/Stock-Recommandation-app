
import Wallet from "../models/Wallet.js";
import Holding from "../models/Holding.js";

export const getPortfolioSummary = async (req, res) => {
  try {
    const userId = req.user.userId;

    const wallet = await Wallet.findOne({
      user: userId,
    }).lean();

    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: "Wallet not found",
      });
    }

    const holdings = await Holding.find({
      user: userId,
    })
      .populate("stock", "companyName exchange currentPrice priceDataDate priceUpdatedAt")
      .lean();

    let totalCurrentValue = 0;
    let totalInvested = 0;

    const formattedHoldings = holdings.map((holding) => {
      const currentPrice = holding.stock?.currentPrice ?? 0;

      const currentValue = Number(
        (holding.quantity * currentPrice).toFixed(2)
      );

      const investedAmount = Number(
        holding.investedAmount.toFixed(2)
      );

      const holdingProfitLoss = Number(
        (currentValue - investedAmount).toFixed(2)
      );

      totalCurrentValue += currentValue;
      totalInvested += investedAmount;

      return {
        ...holding,
        currentPrice,
        currentValue,
        investedAmount,
        profitLoss: holdingProfitLoss,
        priceDataDate: holding.stock?.priceDataDate ?? null,
        priceUpdatedAt: holding.stock?.priceUpdatedAt ?? null,
      };
    });

    totalCurrentValue = Number(totalCurrentValue.toFixed(2));
    totalInvested = Number(totalInvested.toFixed(2));

    const profitLoss = Number(
      (totalCurrentValue - totalInvested).toFixed(2)
    );

    const portfolioValue = Number(
      (wallet.availableBalance + totalCurrentValue).toFixed(2)
    );

    return res.status(200).json({
      success: true,
      data: {
        availableBalance: wallet.availableBalance,
        totalInvested,
        totalCurrentValue,
        profitLoss,
        portfolioValue,
        holdings: formattedHoldings,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
