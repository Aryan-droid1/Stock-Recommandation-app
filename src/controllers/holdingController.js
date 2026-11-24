
import Holding from "../models/Holding.js";

export const getMyHoldings = async (req, res) => {
  try {
    const holdings = await Holding.find({
      user: req.user.userId,
    })
      .populate("stock", "companyName exchange currentPrice")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: holdings.length,
      data: holdings,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
