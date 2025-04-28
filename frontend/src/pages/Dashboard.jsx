import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import CountUp from "react-countup";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
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
          { headers: { Authorization: `Bearer ${token}` } }
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

  const totalJobs = jobs.length;
  const statusCounts = jobs.reduce(
    (acc, job) => {
      acc[job.status] = (acc[job.status] || 0) + 1;
      return acc;
    },
    { Saved: 0, Applied: 0, Interviewing: 0, Offer: 0, Rejected: 0, Ghosted: 0 }
  );
  const statusPercentages = Object.keys(statusCounts).reduce((acc, status) => {
    acc[status] = totalJobs ? ((statusCounts[status] / totalJobs) * 100).toFixed(1) : 0;
    return acc;
  }, {});

  const today = new Date();
  const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  const upcomingInterviews = jobs
    .filter((job) => {
      if (!job.interview_date) return false;
      const interviewDate = new Date(job.interview_date);
      const isValidDate = !isNaN(interviewDate.getTime());
      const isWithinRange = isValidDate && interviewDate <= nextWeek && interviewDate >= today;
      return isWithinRange;
    })
    .sort((a, b) => new Date(a.interview_date) - new Date(b.interview_date));

  // Debug: Log the upcoming interviews to verify filtering
  console.log("Jobs:", jobs);
  console.log("Upcoming Interviews:", upcomingInterviews);

  const activityTimeline = jobs
    .flatMap((job) => [
      { date: job.date_applied, type: "Applied", details: `${job.company} - ${job.position}` },
      ...(job.interview_date ? [{ date: job.interview_date, type: "Interview Scheduled", details: `${job.company} - ${job.position}` }] : []),
      ...(job.status === "Rejected" || job.status === "Offer" || job.status === "Ghosted"
        ? [{ date: job.updated_at || job.date_applied, type: job.status, details: `${job.company} - ${job.position}` }]
        : []),
    ])
    .filter((activity) => activity.date)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  const filteredJobs = jobs.filter((job) =>
    (job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
     job.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
     job.location?.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (statusFilter ? job.status === statusFilter : true)
  );

  // Extract username from token (assuming JWT with payload)
  const token = localStorage.getItem("token");
  let username = "User";
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      username = payload.username || payload.name || "User";
    } catch (e) {
      console.error("Invalid token:", e);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans antialiased">
      {/* Welcome Message */}
      <div className="bg-blue-600 text-white p-2 text-center font-semibold">
        Welcome, {username}!
      </div>

      {/* Sticky Header */}
      <header className="sticky top-0 bg-gray-800 text-white p-3 flex justify-between items-center shadow-md z-20">
        <h1 className="text-lg font-bold">Dashboard</h1>
        <button
          onClick={() => {
            localStorage.removeItem("token");
            navigate("/");
          }}
          className="bg-red-600 px-2 py-1 rounded hover:bg-red-500 text-sm"
        >
          Logout
        </button>
      </header>

      <div className="max-w-6xl mx-auto p-4 pt-16">
        {error && <div className="text-red-500 mb-2">{error}</div>}

        {/* Upcoming Interviews */}
        <section className="mb-4">
          <h2 className="text-lg font-semibold mb-2">Upcoming Interviews</h2>
          {upcomingInterviews.length === 0 ? (
            <p className="text-sm">No interviews scheduled in the next 7 days.</p>
          ) : (
            <div className="space-y-2">
              {upcomingInterviews.map((job) => {
                const interviewDate = new Date(job.interview_date);
                const timeDiff = interviewDate - new Date();
                const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
                return (
                  <div key={job.id} className="bg-white p-2 rounded shadow flex justify-between">
                    <div>
                      <h3 className="text-sm font-semibold">{job.company} - {job.position}</h3>
                      <p className="text-xs">{interviewDate.toLocaleString()}</p>
                    </div>
                    <p className="text-xs">In {daysLeft} day{daysLeft !== 1 ? "s" : ""}</p>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Job Application Statistics */}
        <section className="mb-4">
          <h2 className="text-lg font-semibold mb-2">Application Statistics</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            <div className="bg-white p-2 rounded shadow">
              <h3 className="text-sm">Total Applications</h3>
              <p className="text-lg font-bold">
                <CountUp end={totalJobs} duration={1} />
              </p>
            </div>
            {Object.keys(statusCounts).map((status) => (
              <div key={status} className="bg-white p-2 rounded shadow">
                <h3 className="text-sm">{status}</h3>
                <p className="text-lg font-bold">
                  <CountUp end={statusCounts[status]} duration={1} />
                </p>
              </div>
            ))}
          </div>
          <div className="mt-2">
            <h3 className="text-sm font-semibold">Status Distribution</h3>
            <div className="space-y-1">
              {Object.keys(statusPercentages).map((status) => (
                <div key={status} className="flex items-center">
                  <span className="w-20 text-xs">{status}</span>
                  <div className="flex-1 h-2 bg-gray-200 rounded">
                    <div
                      className={`h-2 rounded ${status === 'Applied' ? 'bg-blue-500' : status === 'Offer' ? 'bg-green-500' : 'bg-gray-400'}`}
                      style={{ width: `${statusPercentages[status]}%` }}
                    ></div>
                  </div>
                  <span className="ml-2 text-xs">{statusPercentages[status]}%</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Recent Activity Timeline */}
        <section className="mb-4">
          <h2 className="text-lg font-semibold mb-2">Recent Activity</h2>
          {activityTimeline.length === 0 ? (
            <p className="text-sm">No recent activity.</p>
          ) : (
            <div className="space-y-2">
              {activityTimeline.map((activity, index) => (
                <div key={index} className="flex items-start">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-1"></div>
                  <div className="ml-2">
                    <p className="text-sm font-semibold">{activity.type}</p>
                    <p className="text-xs">{activity.details}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.date).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Search and Filters */}
        <section className="mb-4">
          <h1 className="text-lg font-semibold mb-2">Filter Jobs</h1>
          <div className="flex flex-col md:flex-row gap-2 mb-2">
            <input
              type="text"
              placeholder="Search by company, position, or location"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="p-1 border rounded w-full md:w-1/2 text-sm"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="p-1 border rounded w-full md:w-1/3 text-sm"
            >
              <option value="">All Statuses</option>
              <option value="Saved">Saved</option>
              <option value="Applied">Applied</option>
              <option value="Interviewing">Interviewing</option>
              <option value="Offer">Offer</option>
              <option value="Rejected">Rejected</option>
              <option value="Ghosted">Ghosted</option>
            </select>
          </div>
        </section>

        {/* Add/Edit Job Form */}
        <section className="mb-4">
          <h1 className="text-lg font-semibold mb-2">Add Jobs</h1>
          <form onSubmit={addOrUpdateJob} className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
            <input
              type="text"
              placeholder="Company"
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
              required
              className="p-1 border rounded text-sm"
            />
            <input
              type="text"
              placeholder="Position"
              value={form.position}
              onChange={(e) => setForm({ ...form, position: e.target.value })}
              required
              className="p-1 border rounded text-sm"
            />
            <select
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="p-1 border rounded text-sm"
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
              className="p-1 border rounded text-sm"
            />
            <input
              type="date"
              placeholder="Date Applied"
              value={form.date_applied}
              onChange={(e) => setForm({ ...form, date_applied: e.target.value })}
              className="p-1 border rounded text-sm"
            />
            <input
              type="url"
              placeholder="Job Link"
              value={form.job_link}
              onChange={(e) => setForm({ ...form, job_link: e.target.value })}
              className="p-1 border rounded text-sm"
            />
            <textarea
              placeholder="Notes"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="p-1 border rounded col-span-1 md:col-span-2 text-sm"
              rows="3"
            />
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              required
              className="p-1 border rounded text-sm"
            >
              <option value="Saved">Saved</option>
              <option value="Applied">Applied</option>
              <option value="Interviewing">Interviewing</option>
              <option value="Offer">Offer</option>
              <option value="Rejected">Rejected</option>
              <option value="Ghosted">Ghosted</option>
            </select>
            <div>
              <h3 className="text-sm">Deadline</h3>
              <input
                type="date"
                placeholder="Deadline"
                value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                className="p-1 border rounded text-sm w-full"
              />
            </div>
            <div>
              <h3 className="text-sm">Interview Date</h3>
              <input
                type="datetime-local"
                placeholder="Interview Date"
                value={form.interview_date}
                onChange={(e) => setForm({ ...form, interview_date: e.target.value })}
                className="p-1 border rounded text-sm w-full"
              />
            </div>
            <div className="col-span-1 md:col-span-2 flex gap-2">
              <button type="submit" className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 text-sm">
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
                  className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 text-sm"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        {/* Jobs List (Cards Layout) */}
        <section>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {filteredJobs.map((job) => (
              <div key={job.id} className="bg-white p-2 rounded shadow hover:shadow-md transition">
                <h3 className="text-sm font-semibold">{job.company}</h3>
                <p className="text-xs text-gray-600">{job.position}</p>
                <p className="text-xs text-gray-500">{job.location || "-"}</p>
                <p className="text-xs">Salary: {job.salary ? `$${job.salary}` : "-"}</p>
                <p className="text-xs">Applied: {job.date_applied?.slice(0, 10) || "-"}</p>
                <p className="text-xs">Status: {job.status}</p>
                <p className="text-xs">
                  Job Link:{" "}
                  {job.job_link ? (
                    <a href={job.job_link} target="_blank" rel="noopener noreferrer" className="text-blue-600">
                      Link
                    </a>
                  ) : (
                    "-"
                  )}
                </p>
                <p className="text-xs">Deadline: {job.deadline?.slice(0, 10) || "-"}</p>
                <p className="text-xs">Interview: {job.interview_date?.slice(0, 16).replace("T", " ") || "-"}</p>
                <div className="mt-1 flex gap-1">
                  <button
                    onClick={() => editJob(job)}
                    className="bg-blue-600 text-white px-1 py-0.5 rounded hover:bg-blue-700 text-xs"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteJob(job.id)}
                    className="bg-red-500 text-white px-1 py-0.5 rounded hover:bg-red-600 text-xs"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default Dashboard;