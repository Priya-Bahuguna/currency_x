import { useState, useEffect } from "react";
import {
  Chart as ChartJS, LineElement, PointElement, LinearScale,
  CategoryScale, Filler, Tooltip, Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import api from "../utils/api";
import toast from "react-hot-toast";

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip, Legend);

const CURRENCIES = ["USD","INR","EUR","GBP","JPY","AUD","CAD","CHF","CNY","SGD","AED"];
const FLAG = {
  USD:"🇺🇸",INR:"🇮🇳",EUR:"🇪🇺",GBP:"🇬🇧",JPY:"🇯🇵",
  AUD:"🇦🇺",CAD:"🇨🇦",CHF:"🇨🇭",CNY:"🇨🇳",SGD:"🇸🇬",AED:"🇦🇪",
};
const NAMES = {
  USD:"US Dollar",INR:"Indian Rupee",EUR:"Euro",GBP:"British Pound",
  JPY:"Japanese Yen",AUD:"Australian Dollar",CAD:"Canadian Dollar",
  CHF:"Swiss Franc",CNY:"Chinese Yuan",SGD:"Singapore Dollar",AED:"UAE Dirham",
};

function buildInsight(from, to, currentRate, predicted, trend, confidence) {
  const diff = ((predicted - currentRate) / currentRate * 100).toFixed(2);
  const absDiff = Math.abs(diff);
  const trendWord = trend === "up" ? "rising" : trend === "down" ? "falling" : "stable";
  const arrow = trend === "up" ? "↑" : trend === "down" ? "↓" : "→";
  return `Rate is ${trendWord} ${arrow}. ML model (confidence: ${confidence}%) predicts ${from}/${to} = ${predicted} next. Change: ${diff > 0 ? "+" : ""}${diff}% (${absDiff < 0.05 ? "very small" : absDiff < 0.2 ? "minor" : "notable"} movement).`;
}

export default function Converter() {
  const [from, setFrom]       = useState("USD");
  const [to, setTo]           = useState("INR");
  const [amount, setAmount]   = useState("1");
  const [result, setResult]   = useState(null);
  const [rateInfo, setRateInfo] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [converting, setConverting] = useState(false);

  useEffect(() => { loadRates(); }, [from, to]);

  const loadRates = async () => {
    try {
      setChartData(null);
      const { data } = await api.get(`/api/convert/rates/${from}/${to}`);
      setRateInfo(data);

      const labels = data.historicalData.map((_, i) => `D${i + 1}`);
      labels.push("Pred");
      const predArr = Array(data.historicalData.length).fill(null);
      predArr.push(data.prediction.predicted);

      setChartData({
        labels,
        datasets: [
          {
            label: `${from}/${to}`,
            data: data.historicalData,
            borderColor: "#7c3aed",
            backgroundColor: "rgba(124,58,237,0.08)",
            tension: 0.4, fill: true,
            pointRadius: 3, pointBackgroundColor: "#7c3aed",
            borderWidth: 2,
          },
          {
            label: "ML Predicted",
            data: predArr,
            borderColor: "#22c55e",
            backgroundColor: "rgba(34,197,94,0.08)",
            pointRadius: 7, pointBackgroundColor: "#22c55e",
            borderDash: [5, 3], borderWidth: 2, tension: 0,
          },
        ],
      });
    } catch { /* silent */ }
  };

  const handleSwap = () => {
    setFrom(to); setTo(from);
    setResult(null); setChartData(null);
  };

  const handleConvert = async (e) => {
    e.preventDefault();
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      toast.error("Enter a valid amount"); return;
    }
    setConverting(true);
    try {
      const { data } = await api.post("/api/convert", {
        fromCurrency: from, toCurrency: to, amount: Number(amount),
      });
      setResult(data);
      toast.success("Saved to history!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Conversion failed");
    } finally {
      setConverting(false);
    }
  };

  const trendIcon  = rateInfo?.prediction?.trend === "up" ? "↑" : rateInfo?.prediction?.trend === "down" ? "↓" : "→";
  const trendClass = rateInfo?.prediction?.trend === "up" ? "trend-up" : rateInfo?.prediction?.trend === "down" ? "trend-down" : "trend-flat";

  const chartOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: "#7a85a0", font: { size: 11 }, boxWidth: 20 } },
      tooltip: {
        backgroundColor: "#0f1422", borderColor: "#1f2535", borderWidth: 1,
        titleColor: "#e2e8f8", bodyColor: "#7a85a0",
      },
    },
    scales: {
      x: { grid: { color: "rgba(31,37,53,0.6)" }, ticks: { color: "#3d4560", font: { size: 10 } } },
      y: { grid: { color: "rgba(31,37,53,0.6)" }, ticks: { color: "#3d4560", font: { size: 10 } } },
    },
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Currency Converter</h1>
        <p>ML-powered conversion with rate prediction &amp; trend analysis</p>
      </div>

      <div className="grid-2" style={{ gap: 24 }}>
        {/* LEFT */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Converter card */}
          <div className="card">
            <form onSubmit={handleConvert}>
              <div className="form-group">
                <label className="form-label">Amount</label>
                <input
                  className="form-input text-mono"
                  type="number" min="0.01" step="any"
                  value={amount}
                  onChange={(e) => { setAmount(e.target.value); setResult(null); }}
                  placeholder="Enter amount"
                />
              </div>

              <div className="convert-row">
                <div className="form-group">
                  <label className="form-label">From</label>
                  <select
                    className="form-input"
                    value={from}
                    onChange={(e) => { setFrom(e.target.value); setResult(null); }}
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c} value={c}>{FLAG[c]} {c} — {NAMES[c]}</option>
                    ))}
                  </select>
                </div>

                <button type="button" className="swap-btn" onClick={handleSwap} title="Swap">⇄</button>

                <div className="form-group">
                  <label className="form-label">To</label>
                  <select
                    className="form-input"
                    value={to}
                    onChange={(e) => { setTo(e.target.value); setResult(null); }}
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c} value={c}>{FLAG[c]} {c} — {NAMES[c]}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-full"
                style={{ padding: "13px", fontSize: 15 }}
                disabled={converting}
              >
                ⚡ {converting ? "Converting..." : "Convert Now"}
              </button>
            </form>

            {result && (
              <div className="result-card">
                <div className="result-from">{result.amount} {result.from} =</div>
                <div className="result-amount">
                  {result.result.toLocaleString("en-IN", { maximumFractionDigits: 4 })}
                </div>
                <div className="result-currency">{NAMES[result.to]} ({result.to})</div>
                <div style={{ marginTop: 14, display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                  <span className="badge badge-purple">Rate: {result.rate}</span>
                  {result.predictedRate && (
                    <span className="badge badge-green">ML Next: {result.predictedRate}</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Rate Intelligence */}
          {rateInfo && (
            <div className="card">
              <div className="card-title">
                <span>Rate Intelligence</span>
                <span className="ml-tag">🤖 ML Model</span>
              </div>

              <div className="grid-2" style={{ gap: 12, marginBottom: 16 }}>
                <div className="stat-card">
                  <div className="stat-val" style={{ fontSize: 22 }}>{rateInfo.currentRate}</div>
                  <div className="stat-label">Current Rate</div>
                </div>
                <div className="stat-card">
                  <div className={`stat-val ${trendClass}`} style={{ fontSize: 22 }}>
                    {trendIcon} {rateInfo.prediction?.predicted}
                  </div>
                  <div className="stat-label">ML Prediction</div>
                </div>
              </div>

              <div className="insight-box">
                <div className="insight-title">🧠 AI Insight</div>
                <div className="insight-text">
                  {buildInsight(
                    from, to,
                    rateInfo.currentRate,
                    rateInfo.prediction?.predicted,
                    rateInfo.prediction?.trend,
                    rateInfo.prediction?.confidence
                  )}
                </div>
                <div style={{ marginTop: 10 }}>
                  <span className="badge badge-purple" style={{ fontSize: 11 }}>
                    ML Model · {rateInfo.prediction?.confidence}% confidence · 30 data pts
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT — Chart */}
        <div className="card" style={{ display: "flex", flexDirection: "column" }}>
          <div className="card-title">
            <span>{from}/{to} Rate Trend</span>
            <span className="badge badge-purple">12-Day History</span>
          </div>

          {chartData ? (
            <div style={{ flex: 1, minHeight: 300 }}>
              <Line data={chartData} options={chartOptions} height={300} />
            </div>
          ) : (
            <div className="spinner" />
          )}

          {rateInfo && (
            <div style={{ marginTop: 16, padding: "12px 14px", background: "var(--bg3)", borderRadius: "var(--r)", fontSize: 12, color: "var(--text2)", lineHeight: 1.65 }}>
              <strong style={{ color: "var(--accent3)" }}>How it works:</strong>{" "}
              Linear Regression trained on 12-day historical cross-rates predicts next day's exchange rate. No external APIs — fully self-contained ML model.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
