import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import toast from "react-hot-toast";

const FLAG = {
  USD:"🇺🇸",INR:"🇮🇳",EUR:"🇪🇺",GBP:"🇬🇧",JPY:"🇯🇵",
  AUD:"🇦🇺",CAD:"🇨🇦",CHF:"🇨🇭",CNY:"🇨🇳",SGD:"🇸🇬",AED:"🇦🇪",
};

export default function Dashboard() {
  const { user } = useAuth();

  const [history, setHistory]     = useState([]);
  const [histLoading, setHistLoading] = useState(true);

  // Edit profile
  const [editOpen, setEditOpen]   = useState(false);
  const [nameVal, setNameVal]     = useState(user?.name || "");
  const [nameErr, setNameErr]     = useState("");
  const [nameSaving, setNameSaving] = useState(false);

  // Change password
  const [pwOpen, setPwOpen]       = useState(false);
  const [pw, setPw]               = useState({ current: "", next: "", confirm: "" });
  const [pwErr, setPwErr]         = useState("");
  const [pwSaving, setPwSaving]   = useState(false);
  const [showPw, setShowPw]       = useState(false);

  useEffect(() => {
    api.get("/api/history")
      .then(({ data }) => setHistory(data))
      .catch(() => {})
      .finally(() => setHistLoading(false));
  }, []);

  const totalConversions = history.length;
  const uniquePairs = new Set(history.map((h) => `${h.fromCurrency}${h.toCurrency}`)).size;
  const topCurrency = (() => {
    if (!history.length) return "—";
    const cnt = {};
    history.forEach((h) => { cnt[h.fromCurrency] = (cnt[h.fromCurrency] || 0) + 1; });
    return Object.entries(cnt).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";
  })();

  const handleSaveName = async (e) => {
    e.preventDefault();
    if (!nameVal.trim()) { setNameErr("Name cannot be empty"); return; }
    setNameErr(""); setNameSaving(true);
    try {
      const { data } = await api.put("/api/auth/profile", { name: nameVal.trim() });
      const stored = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({ ...stored, name: data.name }));
      toast.success("Name updated!");
      setEditOpen(false);
      setTimeout(() => window.location.reload(), 600);
    } catch (err) {
      setNameErr(err.response?.data?.message || "Update failed");
    } finally {
      setNameSaving(false);
    }
  };

  const handleChangePw = async (e) => {
    e.preventDefault();
    setPwErr("");
    if (pw.next !== pw.confirm) { setPwErr("Passwords do not match"); return; }
    if (pw.next.length < 6)    { setPwErr("Min. 6 characters"); return; }
    setPwSaving(true);
    try {
      await api.put("/api/auth/password", { currentPassword: pw.current, newPassword: pw.next });
      toast.success("Password changed!");
      setPwOpen(false);
      setPw({ current: "", next: "", confirm: "" });
    } catch (err) {
      setPwErr(err.response?.data?.message || "Failed to change password");
    } finally {
      setPwSaving(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>My Dashboard</h1>
        <p>Manage your profile and view your activity</p>
      </div>

      <div className="grid-2" style={{ gap: 24, alignItems: "start" }}>

        {/* ── LEFT COLUMN ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Profile Card */}
          <div className="card">
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
              <div className="avatar avatar-lg">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 800 }}>{user?.name}</div>
                <div style={{ fontSize: 13, color: "var(--text2)", marginTop: 2 }}>{user?.email}</div>
                <div style={{ marginTop: 6 }}>
                  <span className={`badge ${user?.role === "admin" ? "badge-red" : "badge-purple"}`}>
                    {user?.role === "admin" ? "👑 Admin" : "👤 User"}
                  </span>
                </div>
              </div>
            </div>

            <div className="divider" style={{ margin: "0 0 16px" }} />

            <div className="profile-row">
              <span className="profile-row-label">Name</span>
              <span className="profile-row-val">{user?.name}</span>
            </div>
            <div className="profile-row">
              <span className="profile-row-label">Email</span>
              <span className="profile-row-val" style={{ fontSize: 13 }}>{user?.email}</span>
            </div>
            <div className="profile-row">
              <span className="profile-row-label">Role</span>
              <span className="profile-row-val" style={{ textTransform: "capitalize" }}>{user?.role}</span>
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
              <button className="btn btn-primary btn-sm" onClick={() => { setEditOpen(!editOpen); setPwOpen(false); }}>
                {editOpen ? "Cancel" : "✏️ Edit Name"}
              </button>
              <button className="btn btn-outline btn-sm" onClick={() => { setPwOpen(!pwOpen); setEditOpen(false); }}>
                {pwOpen ? "Cancel" : "🔒 Change Password"}
              </button>
            </div>

            {/* Edit Name Form */}
            {editOpen && (
              <form onSubmit={handleSaveName} style={{ marginTop: 16 }}>
                {nameErr && <div className="error-msg">{nameErr}</div>}
                <div className="form-group">
                  <label className="form-label">New Name</label>
                  <input
                    className="form-input"
                    type="text"
                    value={nameVal}
                    onChange={(e) => setNameVal(e.target.value)}
                    placeholder="Your full name"
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary btn-sm" disabled={nameSaving}>
                  {nameSaving ? "Saving..." : "Save Name"}
                </button>
              </form>
            )}

            {/* Change Password Form */}
            {pwOpen && (
              <form onSubmit={handleChangePw} style={{ marginTop: 16 }}>
                {pwErr && <div className="error-msg">{pwErr}</div>}
                <div className="form-group">
                  <label className="form-label">Current Password</label>
                  <input
                    className="form-input"
                    type={showPw ? "text" : "password"}
                    value={pw.current}
                    onChange={(e) => setPw({ ...pw, current: e.target.value })}
                    placeholder="••••••••"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <input
                    className="form-input"
                    type={showPw ? "text" : "password"}
                    value={pw.next}
                    onChange={(e) => setPw({ ...pw, next: e.target.value })}
                    placeholder="Min. 6 characters"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm New Password</label>
                  <input
                    className="form-input"
                    type={showPw ? "text" : "password"}
                    value={pw.confirm}
                    onChange={(e) => setPw({ ...pw, confirm: e.target.value })}
                    placeholder="Re-enter new password"
                    required
                  />
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12 }}>
                  <input
                    type="checkbox"
                    id="showpw"
                    checked={showPw}
                    onChange={() => setShowPw(!showPw)}
                    style={{ accentColor: "var(--accent)", cursor: "pointer" }}
                  />
                  <label htmlFor="showpw" style={{ fontSize: 13, color: "var(--text2)", cursor: "pointer" }}>
                    Show passwords
                  </label>
                </div>
                <button type="submit" className="btn btn-primary btn-sm" disabled={pwSaving}>
                  {pwSaving ? "Updating..." : "Update Password"}
                </button>
              </form>
            )}
          </div>

          {/* Stats */}
          <div className="grid-3" style={{ gap: 12 }}>
            <div className="stat-card">
              <div className="stat-val">{totalConversions}</div>
              <div className="stat-label">Conversions</div>
            </div>
            <div className="stat-card">
              <div className="stat-val">{uniquePairs}</div>
              <div className="stat-label">Pairs Used</div>
            </div>
            <div className="stat-card">
              <div className="stat-val" style={{ fontSize: 18 }}>{FLAG[topCurrency] || ""} {topCurrency}</div>
              <div className="stat-label">Top Currency</div>
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN — Recent Activity ── */}
        <div className="card">
          <div className="card-title">
            <span>Recent Conversions</span>
            <span className="badge badge-purple">{totalConversions} total</span>
          </div>

          {histLoading ? (
            <div className="spinner" />
          ) : history.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <h3>No conversions yet</h3>
              <p>Make your first conversion in the Converter tab</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {history.slice(0, 12).map((h) => (
                <div
                  key={h._id}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "11px 14px", background: "var(--bg3)",
                    borderRadius: "var(--r)", border: "1px solid var(--border)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{
                      background: "var(--accent-glow2)", borderRadius: 6,
                      padding: "3px 10px", fontFamily: "var(--mono)",
                      fontSize: 12, fontWeight: 700, color: "var(--accent2)",
                      border: "1px solid var(--border2)",
                    }}>
                      {h.fromCurrency} → {h.toCurrency}
                    </span>
                    <span style={{ fontSize: 13, color: "var(--text2)" }}>
                      {h.amount.toLocaleString()} →{" "}
                      <strong style={{ color: "var(--text)" }}>
                        {h.result.toLocaleString("en-IN", { maximumFractionDigits: 4 })}
                      </strong>
                    </span>
                  </div>
                  <span style={{ fontSize: 11, color: "var(--text3)", flexShrink: 0 }}>
                    {new Date(h.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                  </span>
                </div>
              ))}
              {history.length > 12 && (
                <p style={{ textAlign: "center", fontSize: 13, color: "var(--text2)", marginTop: 4 }}>
                  +{history.length - 12} more in{" "}
                  <a href="/history" style={{ color: "var(--accent2)", textDecoration: "none", fontWeight: 600 }}>History</a>
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
