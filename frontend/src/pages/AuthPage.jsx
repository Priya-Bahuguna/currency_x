import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function AuthPage() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("login"); // "login" | "register"

  // Login form state
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [showLoginPw, setShowLoginPw] = useState(false);

  // Register form state
  const [regForm, setRegForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [regError, setRegError] = useState("");
  const [regLoading, setRegLoading] = useState(false);
  const [showRegPw, setShowRegPw] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);
    try {
      const user = await login(loginForm.email, loginForm.password);
      toast.success(`Welcome back, ${user.name}!`);
      navigate(user.role === "admin" ? "/admin" : "/converter");
    } catch (err) {
      setLoginError(err.response?.data?.message || "Invalid email or password");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegError("");
    if (regForm.password !== regForm.confirm) { setRegError("Passwords do not match"); return; }
    if (regForm.password.length < 6) { setRegError("Password must be at least 6 characters"); return; }
    setRegLoading(true);
    try {
      const user = await register(regForm.name, regForm.email, regForm.password);
      toast.success(`Welcome, ${user.name}!`);
      navigate("/converter");
    } catch (err) {
      setRegError(err.response?.data?.message || "Registration failed");
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      {/* LEFT HERO */}
      <div className="auth-hero">
        <Link to="/" className="auth-hero-logo">
          <div className="logo-box">₿</div>
          CurrencyX
        </Link>

        <h1>
          ML-powered rates.<br />
          <span>Smart insights.</span><br />
          Zero friction.
        </h1>

        <p>
          A self-contained currency converter built without external APIs.
          Uses Linear Regression ML to predict exchange rates, tracks your
          conversion history, and gives AI-powered insights.
        </p>

        <div className="hero-pills">
          {[
            { icon: "🤖", label: "ML Predictions" },
            { icon: "📊", label: "Rate Charts" },
            { icon: "🕒", label: "History Log" },
            { icon: "🔒", label: "Secure Auth" },
            { icon: "⚡", label: "No API Needed" },
          ].map((p) => (
            <span className="hero-pill" key={p.label}>
              <span>{p.icon}</span> {p.label}
            </span>
          ))}
        </div>

        <div className="hero-stats">
          <div>
            <div className="hero-stat-val">11</div>
            <div className="hero-stat-label">Currencies</div>
          </div>
          <div>
            <div className="hero-stat-val">ML</div>
            <div className="hero-stat-label">Powered</div>
          </div>
          <div>
            <div className="hero-stat-val">Free</div>
            <div className="hero-stat-label">No API Key</div>
          </div>
        </div>
      </div>

      {/* RIGHT FORM */}
      <div className="auth-form-side">
        <div className="auth-form-box">
          {/* Tabs */}
          <div className="auth-tabs">
            <button
              className={`auth-tab ${tab === "login" ? "active" : ""}`}
              onClick={() => { setTab("login"); setLoginError(""); }}
            >
              Sign In
            </button>
            <button
              className={`auth-tab ${tab === "register" ? "active" : ""}`}
              onClick={() => { setTab("register"); setRegError(""); }}
            >
              Create Account
            </button>
          </div>

          {/* LOGIN FORM */}
          {tab === "login" && (
            <>
              <h2 className="auth-form-title">Welcome back</h2>
              <p className="auth-form-sub">Sign in to your CurrencyX account</p>

              {loginError && <div className="error-msg">{loginError}</div>}

              <form onSubmit={handleLogin}>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <div className="form-input-icon">
                    <span className="icon">✉</span>
                    <input
                      className="form-input"
                      type="email"
                      placeholder="you@example.com"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Password</label>
                  <div className="form-input-icon">
                    <span className="icon">🔒</span>
                    <input
                      className="form-input"
                      type={showLoginPw ? "text" : "password"}
                      placeholder="••••••••"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      required
                    />
                    <span
                      className="icon-right"
                      onClick={() => setShowLoginPw(!showLoginPw)}
                      style={{ cursor: "pointer", userSelect: "none" }}
                    >
                      {showLoginPw ? "🙈" : "👁"}
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-full"
                  style={{ marginTop: 8, padding: "13px" }}
                  disabled={loginLoading}
                >
                  {loginLoading ? "Signing in..." : "Sign In →"}
                </button>
              </form>

              <p style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "var(--text2)" }}>
                Don't have an account?{" "}
                <button
                  onClick={() => setTab("register")}
                  style={{ background: "none", border: "none", color: "var(--accent2)", fontWeight: 700, cursor: "pointer", fontSize: 13 }}
                >
                  Create one free →
                </button>
              </p>
            </>
          )}

          {/* REGISTER FORM */}
          {tab === "register" && (
            <>
              <h2 className="auth-form-title">Create account</h2>
              <p className="auth-form-sub">Get started with CurrencyX for free</p>

              {regError && <div className="error-msg">{regError}</div>}

              <form onSubmit={handleRegister}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <div className="form-input-icon">
                    <span className="icon">👤</span>
                    <input
                      className="form-input"
                      type="text"
                      placeholder="Your name"
                      value={regForm.name}
                      onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <div className="form-input-icon">
                    <span className="icon">✉</span>
                    <input
                      className="form-input"
                      type="email"
                      placeholder="you@example.com"
                      value={regForm.email}
                      onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Password</label>
                  <div className="form-input-icon">
                    <span className="icon">🔒</span>
                    <input
                      className="form-input"
                      type={showRegPw ? "text" : "password"}
                      placeholder="Min. 6 characters"
                      value={regForm.password}
                      onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                      required
                    />
                    <span
                      className="icon-right"
                      onClick={() => setShowRegPw(!showRegPw)}
                      style={{ cursor: "pointer", userSelect: "none" }}
                    >
                      {showRegPw ? "🙈" : "👁"}
                    </span>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Confirm Password</label>
                  <div className="form-input-icon">
                    <span className="icon">🔒</span>
                    <input
                      className="form-input"
                      type="password"
                      placeholder="Re-enter password"
                      value={regForm.confirm}
                      onChange={(e) => setRegForm({ ...regForm, confirm: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-full"
                  style={{ marginTop: 8, padding: "13px" }}
                  disabled={regLoading}
                >
                  {regLoading ? "Creating Account..." : "Create Account →"}
                </button>
              </form>

              <p style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "var(--text2)" }}>
                Already have an account?{" "}
                <button
                  onClick={() => setTab("login")}
                  style={{ background: "none", border: "none", color: "var(--accent2)", fontWeight: 700, cursor: "pointer", fontSize: 13 }}
                >
                  Sign in →
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
