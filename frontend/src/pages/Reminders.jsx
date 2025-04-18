import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import { toast } from "react-toastify";

function Reminders() {
  const [reminders, setReminders] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [form, setForm] = useState({
    job_id: "",
    type: "Deadline",
    message: "",
    remind_at: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const fetchReminders = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }

    try {
      const res = await axios.get("http://localhost:3001/api/reminders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReminders(res.data);
      setError("");
    } catch (err) {
      console.error("Fetch Reminders Error:", err.response || err);
      setError(err.response?.data?.message || "Failed to fetch reminders");
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/");
      }
    }
  };

  const fetchJobs = async () => {
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
    } catch (err) {
      console.error("Fetch Jobs Error:", err.response || err);
      toast.error(err.response?.data?.message || "Failed to fetch jobs");
    }
  };

  const createReminder = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }

    try {
      await axios.post("http://localhost:3001/api/reminders", form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setForm({ job_id: "", type: "Deadline", message: "", remind_at: "" });
      fetchReminders();
      toast.success("Reminder created successfully");
    } catch (err) {
      console.error("Create Reminder Error:", err.response || err);
      setError(err.response?.data?.message || "Failed to create reminder");
      toast.error(err.response?.data?.message || "Failed to create reminder");
    }
  };

  useEffect(() => {
    fetchReminders();
    fetchJobs();
  }, []);

  const calendarEvents = reminders.map((r) => ({
    title: `${r.type}: ${r.company ? `${r.company} - ${r.position}` : r.message}`,
    start: r.remind_at,
    extendedProps: { type: r.type },
  }));

  return (
    <div style={containerStyle}>
      <h2>Reminders</h2>
      {error && <div style={errorStyle}>{error}</div>}
      <div style={{ marginBottom: "20px" }}>
        <h3>Create Reminder</h3>
        <form onSubmit={createReminder} style={formStyle}>
          <select
            value={form.job_id}
            onChange={(e) => setForm({ ...form, job_id: e.target.value })}
            style={inputStyle}
          >
            <option value="">No Job</option>
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.company} - {job.position}
              </option>
            ))}
          </select>
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            style={inputStyle}
          >
            <option value="Deadline">Deadline</option>
            <option value="Follow-up">Follow-up</option>
            <option value="Interview">Interview</option>
          </select>
          <input
            type="text"
            placeholder="Message"
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            required
            style={inputStyle}
          />
          <input
            type="datetime-local"
            value={form.remind_at}
            onChange={(e) => setForm({ ...form, remind_at: e.target.value })}
            required
            style={inputStyle}
          />
          <button type="submit" style={buttonStyle}>
            Create Reminder
          </button>
        </form>
      </div>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, listPlugin]}
        initialView="dayGridMonth"
        events={calendarEvents}
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
        }}
        eventColor="#4a69bd"
        height="auto"
      />
    </div>
  );
}

const containerStyle = { padding: "20px", maxWidth: "1000px", margin: "0 auto" };
const errorStyle = { color: "red", marginBottom: "10px" };
const formStyle = {
  display: "flex",
  gap: "10px",
  flexWrap: "wrap",
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

export default Reminders;