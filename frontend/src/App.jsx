import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import { ProtectedRoute, AdminRoute } from "./components/ProtectedRoute";

import AuthPage   from "./pages/AuthPage";
import Converter  from "./pages/Converter";
import History    from "./pages/History";
import Dashboard  from "./pages/Dashboard";
import Admin      from "./pages/Admin";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Auth pages — full screen, no navbar */}
          <Route path="/login"    element={<AuthPage />} />
          <Route path="/register" element={<AuthPage />} />

          {/* App pages — with navbar */}
          <Route path="/*" element={
            <div className="app-shell">
              <Navbar />
              <Routes>
                <Route path="/" element={<Navigate to="/converter" replace />} />
                <Route path="converter" element={
                  <ProtectedRoute><Converter /></ProtectedRoute>
                } />
                <Route path="history" element={
                  <ProtectedRoute><History /></ProtectedRoute>
                } />
                <Route path="dashboard" element={
                  <ProtectedRoute><Dashboard /></ProtectedRoute>
                } />
                <Route path="admin" element={
                  <AdminRoute><Admin /></AdminRoute>
                } />
                <Route path="*" element={<Navigate to="/converter" replace />} />
              </Routes>
            </div>
          } />
        </Routes>

        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#0f1422",
              color: "#e2e8f8",
              border: "1px solid #1f2535",
              fontFamily: "'Inter', sans-serif",
              fontSize: "14px",
            },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}
