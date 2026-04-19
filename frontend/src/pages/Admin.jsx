import { useState, useEffect } from "react";
import api from "../utils/api";
import toast from "react-hot-toast";

export default function Admin() {
  const [users, setUsers]         = useState([]);
  const [allHistory, setAllHistory] = useState([]);
  const [tab, setTab]             = useState("users");
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    Promise.all([api.get("/api/auth/users"), api.get("/api/history/all")])
      .then(([u, h]) => { setUsers(u.data); setAllHistory(h.data); })
      .catch(() => toast.error("Failed to load admin data"))
      .finally(() => setLoading(false));
  }, []);

  const deleteUser = async (id) => {
    if (!confirm("Delete this user permanently?")) return;
    try {
      await api.delete(`/api/auth/users/${id}`);
      setUsers((u) => u.filter((x) => x._id !== id));
      toast.success("User deleted");
    } catch { toast.error("Delete failed"); }
  };

  const fmtDate = (iso) =>
    new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

  if (loading) return <div className="page"><div className="spinner" /></div>;

  return (
    <div className="page">
      <div className="page-header">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <h1>Admin Dashboard</h1>
          <span className="badge badge-red">Admin</span>
        </div>
        <p>Manage users and monitor all platform activity</p>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: 28 }}>
        <div className="stat-card">
          <div className="stat-val">{users.length}</div>
          <div className="stat-label">Total Users</div>
        </div>
        <div className="stat-card">
          <div className="stat-val">{allHistory.length}</div>
          <div className="stat-label">Conversions</div>
        </div>
        <div className="stat-card">
          <div className="stat-val">{new Set(allHistory.map((h) => h.user?._id)).size}</div>
          <div className="stat-label">Active Users</div>
        </div>
        <div className="stat-card">
          <div className="stat-val" style={{ color: "var(--green)" }}>
            {users.filter((u) => u.role === "admin").length}
          </div>
          <div className="stat-label">Admins</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab ${tab === "users" ? "active" : ""}`} onClick={() => setTab("users")}>
          👥 Users ({users.length})
        </button>
        <button className={`tab ${tab === "history" ? "active" : ""}`} onClick={() => setTab("history")}>
          📋 All Conversions ({allHistory.length})
        </button>
      </div>

      {tab === "users" && (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td style={{ fontWeight: 600 }}>{u.name}</td>
                    <td style={{ color: "var(--text2)", fontSize: 13 }}>{u.email}</td>
                    <td>
                      <span className={`badge ${u.role === "admin" ? "badge-red" : "badge-purple"}`}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ color: "var(--text3)", fontSize: 12 }}>{fmtDate(u.createdAt)}</td>
                    <td>
                      {u.role !== "admin" && (
                        <button className="btn btn-danger btn-xs" onClick={() => deleteUser(u._id)}>
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "history" && (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>User</th><th>From</th><th>To</th><th>Amount</th><th>Result</th><th>Date</th>
                </tr>
              </thead>
              <tbody>
                {allHistory.map((h) => (
                  <tr key={h._id}>
                    <td style={{ fontSize: 13 }}>
                      <div style={{ fontWeight: 600 }}>{h.user?.name || "Deleted"}</div>
                      <div style={{ color: "var(--text3)", fontSize: 11 }}>{h.user?.email}</div>
                    </td>
                    <td className="text-mono fw-700">{h.fromCurrency}</td>
                    <td className="text-mono fw-700">{h.toCurrency}</td>
                    <td className="text-mono">{h.amount.toLocaleString()}</td>
                    <td className="text-mono text-accent fw-700">
                      {h.result.toLocaleString("en-IN", { maximumFractionDigits: 4 })}
                    </td>
                    <td style={{ color: "var(--text3)", fontSize: 12 }}>{fmtDate(h.createdAt)}</td>
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
