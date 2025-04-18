import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

// Login Component
const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!email || !password) {
      setError("Email and password are required");
      setIsLoading(false);
      return;
    }

    try {
      console.log("🔐 Sending login request:", { email });
      const res = await axios.post(
        "http://localhost:3001/api/auth/login",
        { email, password },
        { headers: { "Content-Type": "application/json" } }
      );

      console.log("✅ Login response:", res.data);
      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        navigate("/dashboard");
      } else {
        setError("No token received from server");
      }
    } catch (err) {
      console.error("❌ Login error:", err.response?.data || err);
      setError(err.response?.data?.message || "Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-form">
      <h2>Login to Job Tracker</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleLogin}>
        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            disabled={isLoading}
            aria-label="Email address"
          />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            disabled={isLoading}
            aria-label="Password"
          />
        </div>
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Logging in..." : "Login"}
        </button>
      </form>
      <p>
        Don’t have an account? <Link to="/signup">Sign up</Link>
      </p>
    </div>
  );
};

// LandingPage Component
const LandingPage = () => {
  return (
    <div>
      {/* Navigation */}
      <nav>
        <div className="logo">Job Tracker</div>
        <div>
          <a href="#hero">Home</a>
          <a href="#features">Features</a>
          <a href="#get-started">Get Started</a>
          <a href="#faq">FAQ</a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section" id="hero">
        <h1>Welcome to Job Tracker</h1>
        <p>
          Streamline your job search with our all-in-one platform to manage
          applications, documents, and interviews.
        </p>
        <a href="#get-started" className="cta-button">
          Get Started
        </a>
      </section>

      {/* Features Section */}
      <section id="features" className="feature-grid">
        <div className="feature-box">
          <span className="icon">📋</span>
          <h3>Manage Job Applications</h3>
          <p>
            Add, update, and delete job applications to stay organized during your
            job search.
          </p>
        </div>
        <div className="feature-box">
          <span className="icon">📁</span>
          <h3>Upload & Store Documents</h3>
          <p>
            Keep your resumes and cover letters in one place for quick and easy
            access.
          </p>
        </div>
        <div className="feature-box">
          <span className="icon">📊</span>
          <h3>Track Application Stages</h3>
          <p>
            Monitor progress like “Applied,” “Interviewing,” or “Offer” with
            visual status tracking.
          </p>
        </div>
        <div className="feature-box">
          <span className="icon">🔍</span>
          <h3>Filter & Search</h3>
          <p>
            Quickly locate specific applications using smart filters and search
            functionality.
          </p>
        </div>
      </section>

      {/* Get Started Section */}
      <section id="get-started" className="get-started-section">
        <h2>Get Started Now</h2>
        <p>
          Log in to manage your job search or create an account to begin tracking
          your applications.
        </p>
        <Login />
      </section>

      {/* FAQ Section */}
      <section id="faq" className="faq-section">
        <h2>Frequently Asked Questions</h2>
        <div className="faq">
          <h3>Is Job Tracker free to use?</h3>
          <p>Yes! Job Tracker is free for personal use with all core features.</p>
          <h3>Can I upload documents?</h3>
          <p>
            Absolutely, you can upload resumes, cover letters, and other documents
            securely.
          </p>
          <h3>Is my data secure?</h3>
          <p>
            We use industry-standard encryption and best practices to keep your
            data safe.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <p>&copy; 2025 Job Tracker. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
export { Login };