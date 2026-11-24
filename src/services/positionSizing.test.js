import { calculatePositionSize } from "./recommendationService.js";

const testTrade = {
  entryPrice: 1000,
  stopLoss: 970,
  target: 1060,
};

const result = calculatePositionSize(
  100000,
  1,
  testTrade
);

console.log(result);