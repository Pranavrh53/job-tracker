import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!email) {
      setError("Email is required");
      setIsLoading(false);
      return;
    }

    try {
      await axios.post("http://localhost:3001/api/auth/forgot-password", { email });
      toast.success("Password reset email sent");
      navigate("/");
    } catch (err) {
      console.error("Forgot Password Error:", err.response || err);
      setError(err.response?.data?.message || "Failed to send reset email");
      toast.error(err.response?.data?.message || "Failed to send reset email");
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
          <label htmlFor="email">Email:</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value.trim())}
            required
            style={inputStyle}
          />
        </div>
        <button type="submit" disabled={isLoading} style={buttonStyle}>
          {isLoading ? "Sending..." : "Send Reset Link"}
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

export default ForgotPassword;