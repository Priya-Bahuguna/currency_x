import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success("Logged out");
    navigate("/login");
  };

  const navCls = ({ isActive }) => (isActive ? "nav-link active" : "nav-link");

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to={user ? "/converter" : "/"} className="navbar-logo">
          <div className="logo-icon">₿</div>
          Currency<span className="logo-x">X</span>
        </Link>

        <div className="nav-links">
          {user ? (
            <>
              <NavLink to="/converter" className={navCls}>Converter</NavLink>
              <NavLink to="/history"   className={navCls}>History</NavLink>
              {user.role === "admin" && (
                <NavLink to="/admin" className={navCls}>Admin</NavLink>
              )}
              <Link to="/dashboard" className="nav-user" style={{ marginLeft: 8 }}>
                <div className="avatar avatar-sm">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <span className="nav-name">{user.name}</span>
              </Link>
              <button
                className="btn btn-ghost btn-sm"
                style={{ marginLeft: 4 }}
                onClick={handleLogout}
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">Sign In</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Create Account</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
