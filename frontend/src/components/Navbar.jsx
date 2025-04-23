import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";



function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = localStorage.getItem("token");
  const isAuthPage =
    location.pathname === "/" ||
    location.pathname === "/register" ||
    location.pathname === "/forgot-password" ||
    location.pathname.startsWith("/reset-password");

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true";
  });

  useEffect(() => {
    document.body.className = darkMode ? "dark-mode" : "light-mode";
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    toast.success("Logged out successfully");
    navigate("/");
  };

  if (isAuthPage) {
    return null;
  }
  const Navbar = () => {
    return (
      <nav className="mb-4 text-center">
        <Link to="/" className="mx-2 text-blue-600 hover:underline">Home</Link>
        <Link to="/add-job" className="mx-2 text-blue-600 hover:underline">Add Job</Link>
        <Link to="/insights" className="mx-2 text-blue-600 hover:underline">Insights</Link>
      </nav>
    );
  };

  

  return (
    <nav
      style={{
        padding: "15px",
        background: darkMode ? "#2c3e50" : "#4a69bd",
        color: "white",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div>
        <span style={{ fontWeight: "bold", fontSize: "1.2rem", marginRight: "20px" }}>
          Job Tracker
        </span>
        {isLoggedIn && (
          <>
            <Link to="/dashboard" style={linkStyle}>
              Dashboard
            </Link>
            <Link to="/documents" style={linkStyle}>
              Documents
            </Link>
            <Link to="/analytics" style={linkStyle}>
              Analytics
            </Link>
            <Link to="/reminders" style={linkStyle}>
              Reminders
            </Link>
          </>
        )}
      </div>
      {isLoggedIn && (
        <div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            style={{ ...buttonStyle, marginRight: "10px" }}
          >
            {darkMode ? "Light Mode" : "Dark Mode"}
          </button>
          <button onClick={handleLogout} style={buttonStyle}>
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}

const linkStyle = {
  marginRight: "15px",
  color: "white",
  textDecoration: "none",
};

const buttonStyle = {
  background: "transparent",
  border: "1px solid white",
  color: "white",
  padding: "5px 10px",
  cursor: "pointer",
  borderRadius: "4px",
};

export default Navbar