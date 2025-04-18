import React, { useState } from "react";
import axios from "axios";
import { useNavigate, useParams, Link } from "react-router-dom";
import { toast } from "react-toastify";

function ResetPassword() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { token } = useParams();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!password) {
      setError("Password is required");
      setIsLoading(false);
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setIsLoading(false);
      return;
    }

    try {
      await axios.post("http://localhost:3001/api/auth/reset-password", { token, password });
      toast.success("Password reset successfully");
      navigate("/");
    } catch (err) {
      console.error("Reset Password Error:", err.response || err);
      setError(err.response?.data?.message || "Failed to reset password");
      toast.error(err.response?.data?.message || "Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      <h2>Reset Password</h2>
      {error && <div style={errorStyle}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <div style={formGroupStyle}>
          <label htmlFor="password">New Password:</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={inputStyle}
          />
        </div>
        <button type="submit" disabled={isLoading} style={buttonStyle}>
          {isLoading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
      <p style={{ marginTop: "15px" }}>
        Back to <Link to="/">Login</Link>
      </p>
    </div>
  );
}

const containerStyle = { maxWidth: "400px", margin: "0 auto", padding: "20px" };
const errorStyle = { color: "red", marginBottom: "15px" };
const formGroupStyle = { marginBottom: "15px" };
const inputStyle = { width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" };
const buttonStyle = {
  padding: "10px 15px",
  background: "#4a69bd",
  color: "white",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
};

export default ResetPassword;