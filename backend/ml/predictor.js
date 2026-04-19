/**
 * ML Module — Linear Regression for Exchange Rate Prediction
 * Uses historical rate data to predict future rates
 */

// Historical base rates vs USD (approximate, for ML training)
const HISTORICAL_RATES = {
  INR: [83.1, 83.3, 83.5, 83.4, 83.6, 83.8, 83.7, 83.9, 84.0, 83.8, 83.95, 84.1],
  EUR: [0.918, 0.919, 0.917, 0.920, 0.921, 0.919, 0.922, 0.920, 0.918, 0.921, 0.923, 0.922],
  GBP: [0.787, 0.788, 0.786, 0.789, 0.790, 0.788, 0.791, 0.789, 0.787, 0.790, 0.792, 0.791],
  JPY: [149.5, 149.8, 150.1, 149.9, 150.3, 150.6, 150.4, 150.8, 151.0, 150.7, 151.2, 151.5],
  AUD: [1.532, 1.535, 1.533, 1.537, 1.539, 1.536, 1.540, 1.538, 1.535, 1.539, 1.541, 1.540],
  CAD: [1.358, 1.360, 1.357, 1.362, 1.364, 1.361, 1.365, 1.363, 1.360, 1.364, 1.366, 1.365],
  CHF: [0.895, 0.894, 0.896, 0.893, 0.895, 0.897, 0.894, 0.896, 0.898, 0.895, 0.897, 0.896],
  CNY: [7.245, 7.248, 7.251, 7.249, 7.253, 7.256, 7.254, 7.258, 7.260, 7.257, 7.262, 7.265],
  SGD: [1.342, 1.344, 1.341, 1.345, 1.347, 1.344, 1.348, 1.346, 1.343, 1.347, 1.349, 1.348],
  AED: [3.672, 3.672, 3.672, 3.672, 3.672, 3.672, 3.672, 3.672, 3.672, 3.672, 3.672, 3.673],
  USD: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
};

/**
 * Simple Linear Regression
 */
function linearRegression(x, y) {
  const n = x.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((acc, xi, i) => acc + xi * y[i], 0);
  const sumX2 = x.reduce((acc, xi) => acc + xi * xi, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  return { slope, intercept };
}

/**
 * Predict next rate for a currency pair
 */
function predictRate(fromCurrency, toCurrency) {
  const fromRates = HISTORICAL_RATES[fromCurrency];
  const toRates = HISTORICAL_RATES[toCurrency];

  if (!fromRates || !toRates) return null;

  const days = fromRates.map((_, i) => i + 1);

  // Calculate cross rates (to/from) for each day
  const crossRates = fromRates.map((rate, i) => toRates[i] / rate);

  const { slope, intercept } = linearRegression(days, crossRates);

  // Predict next day (day 13)
  const nextDay = fromRates.length + 1;
  const predicted = slope * nextDay + intercept;

  return {
    predicted: parseFloat(predicted.toFixed(6)),
    historical: crossRates.map((r) => parseFloat(r.toFixed(6))),
    trend: slope > 0 ? "up" : slope < 0 ? "down" : "stable",
    confidence: calculateConfidence(crossRates, slope, intercept, days),
  };
}

/**
 * R² score as confidence
 */
function calculateConfidence(y, slope, intercept, x) {
  const yMean = y.reduce((a, b) => a + b, 0) / y.length;
  const ssTot = y.reduce((acc, yi) => acc + Math.pow(yi - yMean, 2), 0);
  const ssRes = y.reduce(
    (acc, yi, i) => acc + Math.pow(yi - (slope * x[i] + intercept), 2),
    0
  );
  const r2 = 1 - ssRes / ssTot;
  return parseFloat((Math.max(0, r2) * 100).toFixed(1));
}

/**
 * Get current (latest) rate
 */
function getCurrentRate(fromCurrency, toCurrency) {
  const fromRates = HISTORICAL_RATES[fromCurrency];
  const toRates = HISTORICAL_RATES[toCurrency];

  if (!fromRates || !toRates) return null;

  const latestFrom = fromRates[fromRates.length - 1];
  const latestTo = toRates[toRates.length - 1];

  return parseFloat((latestTo / latestFrom).toFixed(6));
}

/**
 * Get all supported currencies
 */
function getSupportedCurrencies() {
  return Object.keys(HISTORICAL_RATES);
}

module.exports = { predictRate, getCurrentRate, getSupportedCurrencies, HISTORICAL_RATES };
