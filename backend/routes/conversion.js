const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const History = require("../models/History");
const {
  predictRate,
  getCurrentRate,
  getSupportedCurrencies,
  HISTORICAL_RATES,
} = require("../ml/predictor");

// @GET /api/convert/currencies
router.get("/currencies", (req, res) => {
  res.json({ currencies: getSupportedCurrencies() });
});

// @GET /api/convert/rates/:from/:to
router.get("/rates/:from/:to", (req, res) => {
  const { from, to } = req.params;
  const fromC = from.toUpperCase();
  const toC = to.toUpperCase();

  const currentRate = getCurrentRate(fromC, toC);
  const prediction = predictRate(fromC, toC);

  if (!currentRate || !prediction) {
    return res.status(404).json({ message: "Currency pair not supported" });
  }

  res.json({
    from: fromC,
    to: toC,
    currentRate,
    prediction,
    historicalData: prediction.historical,
  });
});

// @POST /api/convert  (authenticated)
router.post("/", protect, async (req, res) => {
  try {
    const { fromCurrency, toCurrency, amount } = req.body;
    const fromC = fromCurrency.toUpperCase();
    const toC = toCurrency.toUpperCase();

    const currentRate = getCurrentRate(fromC, toC);
    const prediction = predictRate(fromC, toC);

    if (!currentRate) {
      return res.status(404).json({ message: "Currency pair not supported" });
    }

    const result = parseFloat((amount * currentRate).toFixed(4));

    // Save to history
    await History.create({
      user: req.user._id,
      fromCurrency: fromC,
      toCurrency: toC,
      amount,
      result,
      rate: currentRate,
      isPredicted: false,
    });

    res.json({
      from: fromC,
      to: toC,
      amount,
      result,
      rate: currentRate,
      predictedRate: prediction?.predicted,
      trend: prediction?.trend,
      confidence: prediction?.confidence,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @GET /api/convert/predict/:from/:to
router.get("/predict/:from/:to", (req, res) => {
  const from = req.params.from.toUpperCase();
  const to = req.params.to.toUpperCase();
  const prediction = predictRate(from, to);

  if (!prediction) {
    return res.status(404).json({ message: "Cannot predict for this pair" });
  }

  res.json({ from, to, ...prediction });
});

module.exports = router;
