import { useState, useEffect } from "react";
import api from "../utils/api";
import toast from "react-hot-toast";

const FLAG = {
  USD:"🇺🇸",INR:"🇮🇳",EUR:"🇪🇺",GBP:"🇬🇧",JPY:"🇯🇵",
  AUD:"🇦🇺",CAD:"🇨🇦",CHF:"🇨🇭",CNY:"🇨🇳",SGD:"🇸🇬",AED:"🇦🇪",
};

export default function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/api/history")
      .then(({ data }) => setHistory(data))
      .catch(() => toast.error("Failed to load history"))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/history/${id}`);
      setHistory((h) => h.filter((x) => x._id !== id));
      toast.success("Entry deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  const fmt = (iso) =>
    new Date(iso).toLocaleString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });

  if (loading) return <div className="page"><div className="spinner" /></div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Conversion History</h1>
        <p>Your last 50 conversions — click × to delete</p>
      </div>

      {history.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>No conversions yet</h3>
            <p>Go to the Converter and make your first conversion</p>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="flex-between" style={{ marginBottom: 18 }}>
            <span style={{ fontWeight: 700 }}>{history.length} Conversions</span>
            <span className="badge badge-purple">{history.length} records</span>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>From</th>
                  <th>To</th>
                  <th>Amount</th>
                  <th>Result</th>
                  <th>Rate</th>
                  <th>Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {history.map((h) => (
                  <tr key={h._id}>
                    <td>
                      <span className="text-mono fw-700">
                        {FLAG[h.fromCurrency] || ""} {h.fromCurrency}
                      </span>
                    </td>
                    <td>
                      <span className="text-mono fw-700">
                        {FLAG[h.toCurrency] || ""} {h.toCurrency}
                      </span>
                    </td>
                    <td className="text-mono">{h.amount.toLocaleString()}</td>
                    <td className="text-mono text-accent fw-700">
                      {h.result.toLocaleString("en-IN", { maximumFractionDigits: 4 })}
                    </td>
                    <td className="text-mono" style={{ color: "var(--text2)", fontSize: 12 }}>
                      {h.rate}
                    </td>
                    <td style={{ color: "var(--text3)", fontSize: 12 }}>{fmt(h.createdAt)}</td>
                    <td>
                      <button
                        className="btn btn-danger btn-xs"
                        onClick={() => handleDelete(h._id)}
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
