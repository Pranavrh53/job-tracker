import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Bar, Line, Pie } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend);

function Analytics() {
  const [analytics, setAnalytics] = useState({
    statusCounts: [],
    appsOverTime: [],
    topCompanies: [],
    offerRatio: 0,
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const fetchAnalytics = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }

    try {
      const res = await axios.get("http://localhost:3001/api/analytics", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAnalytics(res.data);
      setError("");
    } catch (err) {
      console.error("Fetch Analytics Error:", err.response || err);
      setError(err.response?.data?.message || "Failed to fetch analytics");
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/");
      }
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  // Status Counts (Pie Chart)
  const statusData = {
    labels: analytics.statusCounts.map((s) => s.status),
    datasets: [
      {
        data: analytics.statusCounts.map((s) => s.count),
        backgroundColor: ["#3498db", "#e74c3c", "#2ecc71", "#f1c40f", "#9b59b6", "#7f8c8d"],
      },
    ],
  };

  // Applications Over Time (Line Chart)
  const timeData = {
    labels: analytics.appsOverTime.map((a) => a.month),
    datasets: [
      {
        label: "Applications",
        data: analytics.appsOverTime.map((a) => a.count),
        borderColor: "#3498db",
        fill: false,
      },
    ],
  };

  // Top Companies (Bar Chart)
  const companyData = {
    labels: analytics.topCompanies.map((c) => c.company),
    datasets: [
      {
        label: "Applications",
        data: analytics.topCompanies.map((c) => c.count),
        backgroundColor: "#2ecc71",
      },
    ],
  };

  return (
    <div style={containerStyle}>
      <h2>Analytics</h2>
      {error && <div style={errorStyle}>{error}</div>}
      <div style={chartContainerStyle}>
        <div style={chartStyle}>
          <h3>Applications by Status</h3>
          <Pie data={statusData} options={{ responsive: true }} />
        </div>
        <div style={chartStyle}>
          <h3>Applications Over Time</h3>
          <Line data={timeData} options={{ responsive: true }} />
        </div>
        <div style={chartStyle}>
          <h3>Top Companies</h3>
          <Bar data={companyData} options={{ responsive: true }} />
        </div>
        <div style={chartStyle}>
          <h3>Offer-to-Application Ratio</h3>
          <p>{analytics.offerRatio}%</p>
        </div>
      </div>
    </div>
  );
}

const containerStyle = { padding: "20px", maxWidth: "1200px", margin: "0 auto" };
const errorStyle = { color: "red", marginBottom: "10px" };
const chartContainerStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
  gap: "20px",
};
const chartStyle = { padding: "10px", border: "1px solid #ddd", borderRadius: "4px" };

export default Analytics;