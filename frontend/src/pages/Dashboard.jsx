import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function Dashboard() {
  const [jobs, setJobs] = useState([]);
  const [form, setForm] = useState({
    company: "",
    position: "",
    location: "",
    salary: "",
    date_applied: "",
    job_link: "",
    notes: "",
    status: "Saved",
    deadline: "",
    interview_date: "",
  });
  const [editingJobId, setEditingJobId] = useState(null);
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
        headers: { Authorization: `Bearer ${token}` },
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

  const addOrUpdateJob = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }

    try {
      if (editingJobId) {
        await axios.put(
          `http://localhost:3001/api/jobs/${editingJobId}`,
          form,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        toast.success("Job updated successfully");
        setEditingJobId(null);
      } else {
        await axios.post("http://localhost:3001/api/jobs", form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Job added successfully");
      }
      setForm({
        company: "",
        position: "",
        location: "",
        salary: "",
        date_applied: "",
        job_link: "",
        notes: "",
        status: "Saved",
        deadline: "",
        interview_date: "",
      });
      getJobs();
    } catch (err) {
      console.error("Job Error:", err.response || err);
      setError(err.response?.data?.message || "Failed to save job");
      toast.error(err.response?.data?.message || "Failed to save job");
    }
  };

  const editJob = (job) => {
    setEditingJobId(job.id);
    setForm({
      company: job.company || "",
      position: job.position || "",
      location: job.location || "",
      salary: job.salary || "",
      date_applied: job.date_applied ? job.date_applied.slice(0, 10) : "",
      job_link: job.job_link || "",
      notes: job.notes || "",
      status: job.status || "Saved",
      deadline: job.deadline ? job.deadline.slice(0, 10) : "",
      interview_date: job.interview_date
        ? new Date(job.interview_date).toISOString().slice(0, 16)
        : "",
    });
  };

  const deleteJob = async (jobId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }

    if (window.confirm("Are you sure you want to delete this job?")) {
      try {
        await axios.delete(`http://localhost:3001/api/jobs/${jobId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Job deleted successfully");
        getJobs();
      } catch (err) {
        console.error("Delete Job Error:", err.response || err);
        setError(err.response?.data?.message || "Failed to delete job");
        toast.error(err.response?.data?.message || "Failed to delete job");
      }
    }
  };

  useEffect(() => {
    getJobs();
  }, []);

  return (
    <div style={containerStyle}>
      <h2>Job Applications</h2>
      {error && <div style={errorStyle}>{error}</div>}
      <form onSubmit={addOrUpdateJob} style={formStyle}>
        <input
          type="text"
          placeholder="Company"
          value={form.company}
          onChange={(e) => setForm({ ...form, company: e.target.value })}
          required
          style={inputStyle}
        />
        <input
          type="text"
          placeholder="Position"
          value={form.position}
          onChange={(e) => setForm({ ...form, position: e.target.value })}
          required
          style={inputStyle}
        />
        <select
          value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
          style={inputStyle}
        >
          <option value="">Select Location</option>
          <option value="Remote">Remote</option>
          <option value="Onsite">Onsite</option>
          <option value="Hybrid">Hybrid</option>
        </select>
        <input
          type="number"
          placeholder="Salary"
          value={form.salary}
          onChange={(e) => setForm({ ...form, salary: e.target.value })}
          step="0.01"
          style={inputStyle}
        />
        <input
          type="date"
          placeholder="Date Applied"
          value={form.date_applied}
          onChange={(e) => setForm({ ...form, date_applied: e.target.value })}
          style={inputStyle}
        />
        <input
          type="url"
          placeholder="Job Link"
          value={form.job_link}
          onChange={(e) => setForm({ ...form, job_link: e.target.value })}
          style={inputStyle}
        />
        <textarea
          placeholder="Notes"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          style={{ ...inputStyle, height: "100px" }}
        />
        <select
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value })}
          required
          style={inputStyle}
        >
          <option value="Saved">Saved</option>
          <option value="Applied">Applied</option>
          <option value="Interviewing">Interviewing</option>
          <option value="Offer">Offer</option>
          <option value="Rejected">Rejected</option>
          <option value="Ghosted">Ghosted</option>
        </select>
        <input
          type="date"
          placeholder="Deadline"
          value={form.deadline}
          onChange={(e) => setForm({ ...form, deadline: e.target.value })}
          style={inputStyle}
        />
        <input
          type="datetime-local"
          placeholder="Interview Date"
          value={form.interview_date}
          onChange={(e) => setForm({ ...form, interview_date: e.target.value })}
          style={inputStyle}
        />
        <button type="submit" style={buttonStyle}>
          {editingJobId ? "Update Job" : "Add Job"}
        </button>
        {editingJobId && (
          <button
            type="button"
            onClick={() => {
              setEditingJobId(null);
              setForm({
                company: "",
                position: "",
                location: "",
                salary: "",
                date_applied: "",
                job_link: "",
                notes: "",
                status: "Saved",
                deadline: "",
                interview_date: "",
              });
            }}
            style={{ ...buttonStyle, background: "#e74c3c" }}
          >
            Cancel
          </button>
        )}
      </form>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th>Company</th>
            <th>Position</th>
            <th>Location</th>
            <th>Salary</th>
            <th>Date Applied</th>
            <th>Job Link</th>
            <th>Status</th>
            <th>Deadline</th>
            <th>Interview</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => (
            <tr key={job.id}>
              <td>{job.company}</td>
              <td>{job.position}</td>
              <td>{job.location || "-"}</td>
              <td>{job.salary ? `$${job.salary}` : "-"}</td>
              <td>{job.date_applied?.slice(0, 10) || "-"}</td>
              <td>
                {job.job_link ? (
                  <a href={job.job_link} target="_blank" rel="noopener noreferrer">
                    Link
                  </a>
                ) : (
                  "-"
                )}
              </td>
              <td>{job.status}</td>
              <td>{job.deadline?.slice(0, 10) || "-"}</td>
              <td>{job.interview_date?.slice(0, 16).replace("T", " ") || "-"}</td>
              <td>
                <button onClick={() => editJob(job)} style={actionButtonStyle}>
                  Edit
                </button>
                <button
                  onClick={() => deleteJob(job.id)}
                  style={{ ...actionButtonStyle, background: "#e74c3c" }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const containerStyle = { padding: "20px", maxWidth: "1200px", margin: "0 auto" };
const errorStyle = { color: "red", marginBottom: "10px" };
const formStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
  gap: "10px",
  marginBottom: "20px",
};
const inputStyle = { padding: "8px", borderRadius: "4px", border: "1px solid #ccc" };
const buttonStyle = {
  padding: "8px 15px",
  background: "#4a69bd",
  color: "white",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
};
const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  marginTop: "20px",
};
const actionButtonStyle = {
  padding: "5px 10px",
  margin: "0 5px",
  background: "#4a69bd",
  color: "white",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
};

export default Dashboard;