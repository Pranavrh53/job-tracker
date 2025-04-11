import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = localStorage.getItem("token");
  const isAuthPage = location.pathname === "/" || location.pathname === "/register";
  
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  // Don't show navbar on login/register pages
  if (isAuthPage) {
    return null;
  }

  return (
    <nav style={{ 
      padding: "15px", 
      background: "#4a69bd", 
      color: "white",
      display: "flex",
      justifyContent: "space-between"
    }}>
      <div>
        <span style={{ fontWeight: "bold", fontSize: "1.2rem", marginRight: "20px" }}>Job Tracker</span>
        {isLoggedIn && (
          <>
            <Link to="/dashboard" style={{ marginRight: "15px", color: "white", textDecoration: "none" }}>Dashboard</Link>
            <Link to="/documents" style={{ color: "white", textDecoration: "none" }}>Documents</Link>
          </>
        )}
      </div>
      {isLoggedIn && (
        <button 
          onClick={handleLogout}
          style={{
            background: "transparent",
            border: "1px solid white",
            color: "white",
            padding: "5px 10px",
            cursor: "pointer",
            borderRadius: "4px"
          }}
        >
          Logout
        </button>
      )}
    </nav>
  );
}

export default Navbar;