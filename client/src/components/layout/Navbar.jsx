import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Navbar() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
      height: "64px", background: "white",
      borderBottom: "1px solid #e5e7eb",
      padding: "0 16px"
    }}>
      <div style={{
        maxWidth: "1152px", margin: "0 auto", height: "100%",
        display: "flex", alignItems: "center", justifyContent: "space-between"
      }}>

        {/* Logo */}
        <Link to="/" style={{ fontSize: "20px", fontWeight: 700, color: "#2563eb", textDecoration: "none" }}>
          DevConnect
        </Link>

        {/* Nav Links */}
        <div style={{ display: "flex", gap: "24px", fontSize: "14px", fontWeight: 500 }}>
          <Link to="/posts" style={{ color: "#4b5563", textDecoration: "none" }}>Posts</Link>
          <Link to="/jobs" style={{ color: "#4b5563", textDecoration: "none" }}>Jobs</Link>
        </div>

        {/* Right Side — fixed width, no layout shift */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", width: "180px", justifyContent: "flex-end" }}>

          {/* Auth loading — grey skeleton, same size as buttons */}
          {loading && (
            <>
              <div style={{ width: "60px", height: "32px", borderRadius: "8px", background: "#e5e7eb" }} />
              <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#e5e7eb" }} />
            </>
          )}

          {/* Logged in */}
          {!loading && user && (
            <>
              <Link to="/write" style={{
                background: "#2563eb", color: "white", padding: "6px 14px",
                borderRadius: "8px", fontSize: "14px", fontWeight: 500,
                textDecoration: "none"
              }}>
                Write
              </Link>

              {/* Avatar + Dropdown */}
              <div ref={dropdownRef} style={{ position: "relative" }}>
                <img
                  src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=2563eb&color=fff`}
                  alt={user.name}
                  onClick={() => setDropdownOpen((p) => !p)}
                  style={{
                    width: "32px", height: "32px", borderRadius: "50%",
                    cursor: "pointer", border: "2px solid #e5e7eb",
                    objectFit: "cover", display: "block"
                  }}
                />

                {dropdownOpen && (
                  <div style={{
                    position: "absolute", right: 0, top: "40px",
                    width: "192px", background: "white",
                    border: "1px solid #e5e7eb", borderRadius: "8px",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.12)", zIndex: 100
                  }}>
                    {[
                      { to: `/users/${user.username}`, label: "Profile" },
                      { to: "/dashboard", label: "Dashboard" },
                      { to: "/profile/edit", label: "Settings" },
                    ].map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={() => setDropdownOpen(false)}
                        style={{ display: "block", padding: "8px 16px", fontSize: "14px", color: "#111827", textDecoration: "none" }}
                        onMouseEnter={(e) => e.target.style.background = "#f9fafb"}
                        onMouseLeave={(e) => e.target.style.background = "transparent"}
                      >
                        {item.label}
                      </Link>
                    ))}
                    <hr style={{ borderColor: "#e5e7eb", margin: 0 }} />
                    <button
                      onClick={() => { setDropdownOpen(false); logout(); navigate("/"); }}
                      style={{
                        width: "100%", textAlign: "left", padding: "8px 16px",
                        fontSize: "14px", color: "#dc2626", background: "none",
                        border: "none", cursor: "pointer"
                      }}
                      onMouseEnter={(e) => e.target.style.background = "#f9fafb"}
                      onMouseLeave={(e) => e.target.style.background = "transparent"}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Logged out */}
          {!loading && !user && (
            <>
              <Link to="/login" style={{
                border: "1px solid #d1d5db", padding: "6px 14px",
                borderRadius: "8px", fontSize: "14px", fontWeight: 500,
                color: "#374151", textDecoration: "none"
              }}>
                Login
              </Link>
              <Link to="/register" style={{
                background: "#2563eb", color: "white", padding: "6px 14px",
                borderRadius: "8px", fontSize: "14px", fontWeight: 500,
                textDecoration: "none"
              }}>
                Sign Up
              </Link>
            </>
          )}

        </div>
      </div>
    </nav>
  );
}