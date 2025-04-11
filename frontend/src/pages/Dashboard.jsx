import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const [jobs, setJobs] = useState([]);
  const [form, setForm] = useState({ company: "", position: "", status: "", deadline: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const getJobs = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }

    try {
      const res = await axios.get("http://localhost:3001/api/jobs", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setJobs(res.data);
      setError("");
    } catch (err) {
      console.error("Get Jobs Error:", err.response || err);
      setError(err.response?.data?.message || "Failed to fetch jobs");
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/");
      }
    }
  };

  const addJob = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }

    try {
      await axios.post("http://localhost:3001/api/jobs", form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setForm({ company: "", position: "", status: "", deadline: "" });
      getJobs();
    } catch (err) {
      console.error("Add Job Error:", err.response || err);
      setError(err.response?.data?.message || "Failed to add job");
    }
  };

  useEffect(() => {
    getJobs();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Job Applications</h2>
      {error && <div style={{ color: "red", marginBottom: "10px" }}>{error}</div>}
      <form onSubmit={addJob} style={{ marginBottom: "20px" }}>
        {/* Form inputs remain the same */}
        <input type="text" placeholder="Company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} required style={{ marginRight: "10px", padding: "5px" }} />
        <input type="text" placeholder="Position" value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} required style={{ marginRight: "10px", padding: "5px" }} />
        <input type="text" placeholder="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} required style={{ marginRight: "10px", padding: "5px" }} />
        <input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} required style={{ marginRight: "10px", padding: "5px" }} />
        <button type="submit" style={{ padding: "5px 15px" }}>Add Job</button>
      </form>
      <ul>
        {jobs.map(job => (
          <li key={job.id}>{job.company} - {job.position} ({job.status}) - Deadline: {job.deadline}</li>
        ))}
      </ul>
    </div>
  );
}

export default Dashboard;