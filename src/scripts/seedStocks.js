import dns from "node:dns";

dns.setServers(["8.8.8.8", "8.8.4.4"]);
import mongoose from "mongoose";
import dotenv from "dotenv";
import Stock from "../models/Stock.js";


dotenv.config();

const stocks = [
  { symbol: "RELIANCE", companyName: "Reliance Industries", exchange: "NSE" },
  { symbol: "HDFCBANK", companyName: "HDFC Bank", exchange: "NSE" },
  { symbol: "ICICIBANK", companyName: "ICICI Bank", exchange: "NSE" },
  { symbol: "SBIN", companyName: "State Bank of India", exchange: "NSE" },
  { symbol: "AXISBANK", companyName: "Axis Bank", exchange: "NSE" },
  { symbol: "KOTAKBANK", companyName: "Kotak Mahindra Bank", exchange: "NSE" },
  { symbol: "INFY", companyName: "Infosys", exchange: "NSE" },
  { symbol: "TCS", companyName: "Tata Consultancy Services", exchange: "NSE" },
  { symbol: "WIPRO", companyName: "Wipro", exchange: "NSE" },
  { symbol: "HCLTECH", companyName: "HCL Technologies", exchange: "NSE" },
  { symbol: "TATAMOTORS", companyName: "Tata Motors", exchange: "NSE" },
  { symbol: "MARUTI", companyName: "Maruti Suzuki India", exchange: "NSE" },
  { symbol: "M&M", companyName: "Mahindra & Mahindra", exchange: "NSE" },
  { symbol: "TATASTEEL", companyName: "Tata Steel", exchange: "NSE" },
  { symbol: "JSWSTEEL", companyName: "JSW Steel", exchange: "NSE" },
  { symbol: "ITC", companyName: "ITC Limited", exchange: "NSE" },
  { symbol: "HINDUNILVR", companyName: "Hindustan Unilever", exchange: "NSE" },
  { symbol: "BHARTIARTL", companyName: "Bharti Airtel", exchange: "NSE" },
  { symbol: "LT", companyName: "Larsen & Toubro", exchange: "NSE" },
  { symbol: "SUNPHARMA", companyName: "Sun Pharmaceutical", exchange: "NSE" },
  { symbol: "TATACONSUM", companyName: "Tata Consumer Products", exchange: "NSE" },
  { symbol: "NTPC", companyName: "NTPC Limited", exchange: "NSE" },
  { symbol: "POWERGRID", companyName: "Power Grid Corporation", exchange: "NSE" },
  { symbol: "ONGC", companyName: "Oil and Natural Gas Corporation", exchange: "NSE" },
  { symbol: "ADANIENT", companyName: "Adani Enterprises", exchange: "NSE" },
];

const seedStocks = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const operations = stocks.map((stock) => ({
      updateOne: {
        filter: {
          symbol: stock.symbol,
          exchange: stock.exchange,
        },
        update: {
          $setOnInsert: {
            ...stock,
            instrumentKey: null,
          },
        },
        upsert: true,
      },
    }));

    const result = await Stock.bulkWrite(operations, {
      ordered: false,
    });

    console.log("Stock seeding completed");
    console.log("Inserted:", result.upsertedCount);
    console.log("Already existing:", stocks.length - result.upsertedCount);

    const allStocks = await Stock.find({ exchange: "NSE" })
      .select("symbol companyName exchange")
      .sort({ symbol: 1 });

    console.log("Total NSE stocks:", allStocks.length);
    console.table(allStocks.map((stock) => ({
      symbol: stock.symbol,
      company: stock.companyName,
      exchange: stock.exchange,
    })));
  } catch (error) {
    console.error("Stock seeding failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

seedStocks();
