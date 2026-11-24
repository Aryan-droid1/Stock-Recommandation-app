
import Trade from "../models/Trade.js";

export const getTradeHistory = async (req, res) => {
  try {
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 10);

    if (
      !Number.isInteger(page) ||
      page < 1 ||
      !Number.isInteger(limit) ||
      limit < 1 ||
      limit > 50
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Page must be a positive integer and limit must be between 1 and 50",
      });
    }

    const filter = {
      user: req.user.userId,
    };

    // BUY / SELL filter
    if (req.query.type !== undefined) {
      const type = req.query.type.trim().toUpperCase();

      if (!["BUY", "SELL"].includes(type)) {
        return res.status(400).json({
          success: false,
          message: "Type must be BUY or SELL",
        });
      }

      filter.type = type;
    }

    // Stock symbol filter
    if (req.query.symbol !== undefined) {
      const symbol = req.query.symbol.trim().toUpperCase();

      if (!/^[A-Z0-9&-]{1,20}$/.test(symbol)) {
        return res.status(400).json({
          success: false,
          message: "Invalid stock symbol",
        });
      }

      filter.symbol = symbol;
    }

    // Date range filter
    if (req.query.from || req.query.to) {
      const dateFilter = {};

      if (req.query.from) {
        const fromDate = new Date(req.query.from);

        if (isNaN(fromDate.getTime())) {
          return res.status(400).json({
            success: false,
            message: "Invalid from date",
          });
        }

        dateFilter.$gte = fromDate;
      }

      if (req.query.to) {
        const toDate = new Date(req.query.to);

        if (isNaN(toDate.getTime())) {
          return res.status(400).json({
            success: false,
            message: "Invalid to date",
          });
        }

        toDate.setUTCDate(toDate.getUTCDate() + 1);
        dateFilter.$lt = toDate;
      }

      if (
        dateFilter.$gte &&
        dateFilter.$lt &&
        dateFilter.$gte >= dateFilter.$lt
      ) {
        return res.status(400).json({
          success: false,
          message: "From date must be before or equal to date",
        });
      }

      filter.createdAt = dateFilter;
    }

    const skip = (page - 1) * limit;

    const [trades, totalTrades] = await Promise.all([
      Trade.find(filter)
        .populate("stock", "companyName exchange")
        .sort({ createdAt: -1, _id: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      Trade.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalTrades / limit);

    return res.status(200).json({
      success: true,
      data: trades,
      pagination: {
        currentPage: page,
        totalPages,
        totalTrades,
        limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1 && totalPages > 0,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
