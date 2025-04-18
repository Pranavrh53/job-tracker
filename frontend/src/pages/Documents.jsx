import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function Documents() {
  const [file, setFile] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [files, setFiles] = useState([]);
  const [form, setForm] = useState({ job_id: "", file_type: "Other" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [debug, setDebug] = useState(null);
  const navigate = useNavigate();

  // Create API client with error handling
  const apiClient = axios.create({
    baseURL: "http://localhost:3001/api",
  });

  // Add request and response interceptors for debugging
  apiClient.interceptors.request.use(
    config => {
      console.log(`API Request: ${config.method.toUpperCase()} ${config.url}`, config);
      return config;
    },
    error => {
      console.error("API Request Error:", error);
      return Promise.reject(error);
    }
  );

  apiClient.interceptors.response.use(
    response => {
      console.log("API Response:", response);
      return response;
    },
    error => {
      console.error("API Response Error:", error);
      console.error("Error Details:", error.response?.data || error.message);
      return Promise.reject(error);
    }
  );

  const fetchJobs = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }

    try {
      const res = await apiClient.get("/jobs", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setJobs(res.data);
    } catch (err) {
      console.error("Fetch Jobs Error:", err.response || err);
      toast.error(err.response?.data?.message || "Failed to fetch jobs");
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/");
      }
    }
  };

  const fetchFiles = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }

    try {
      const res = await apiClient.get("/files", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFiles(res.data);
      setError("");
    } catch (err) {
      console.error("Fetch Files Error:", err.response || err);
      setError(err.response?.data?.message || "Failed to fetch files");
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/");
      }
    }
  };

  const uploadFile = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }
    if (!file) {
      setError("Please select a file");
      toast.error("Please select a file");
      return;
    }

    setLoading(true);
    setError("");
    setDebug(null);
    
    const formData = new FormData();
    formData.append("file", file);
    if (form.job_id) formData.append("job_id", form.job_id);
    formData.append("file_type", form.file_type);

    // Log what we're uploading
    console.log("Uploading file:", file.name, file.type, file.size);
    console.log("Form data:", {
      job_id: form.job_id || "none",
      file_type: form.file_type
    });

    try {
      const res = await apiClient.post("/files", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("Upload response:", res.data);
      
      setFile(null);
      // Reset file input by clearing the form
      document.getElementById("file-upload").value = "";
      setForm({ job_id: "", file_type: "Other" });
      fetchFiles();
      toast.success("File uploaded successfully");
    } catch (err) {
      console.error("Upload File Error:", err);
      const errorMessage = err.response?.data?.message || "Failed to upload file";
      // Store detailed error info for debugging
      setDebug({
        message: errorMessage,
        status: err.response?.status,
        data: err.response?.data,
        error: err.message
      });
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    fetchFiles();
  }, []);

  const getFileUrl = (filepath) => {
    // Ensure the filepath is correctly formatted for the backend
    const formattedPath = filepath.startsWith("Uploads/")
      ? filepath
      : `Uploads/${filepath}`; // Use uppercase 'U'
    return `http://localhost:3001/${formattedPath}`;
  };

  return (
    <div style={containerStyle}>
      <h2>Documents</h2>
      {error && <div style={errorStyle}>{error}</div>}
      
      {/* Debug information */}
      {debug && (
        <div style={debugStyle}>
          <h4>Debug Information:</h4>
          <pre>{JSON.stringify(debug, null, 2)}</pre>
        </div>
      )}
      
      <form onSubmit={uploadFile} style={formStyle}>
        <input
          id="file-upload"
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          required
          style={inputStyle}
        />
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
          value={form.file_type}
          onChange={(e) => setForm({ ...form, file_type: e.target.value })}
          style={inputStyle}
        >
          <option value="Resume">Resume</option>
          <option value="Cover Letter">Cover Letter</option>
          <option value="Other">Other</option>
        </select>
        <button type="submit" style={buttonStyle} disabled={loading}>
          {loading ? "Uploading..." : "Upload"}
        </button>
      </form>
      
      {files.length > 0 ? (
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={tableCellStyle}>Filename</th>
              <th style={tableCellStyle}>Type</th>
              <th style={tableCellStyle}>Linked Job</th>
              <th style={tableCellStyle}>Uploaded</th>
            </tr>
          </thead>
          <tbody>
            {files.map((f) => (
              <tr key={f.id}>
                <td style={tableCellStyle}>
                  <a 
                    href={getFileUrl(f.filepath)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={linkStyle}
                    onClick={(e) => {
                      console.log("Accessing file URL:", getFileUrl(f.filepath));
                    }}
                  >
                    {f.filename}
                  </a>
                </td>
                <td style={tableCellStyle}>{f.file_type}</td>
                <td style={tableCellStyle}>{f.company ? `${f.company} - ${f.position}` : "-"}</td>
                <td style={tableCellStyle}>{new Date(f.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No files uploaded yet.</p>
      )}
    </div>
  );
}

const containerStyle = { padding: "20px", maxWidth: "1000px", margin: "0 auto" };
const errorStyle = { color: "red", marginBottom: "10px" };
const debugStyle = { 
  backgroundColor: "#f8f9fa", 
  padding: "10px", 
  border: "1px solid #ddd", 
  borderRadius: "4px", 
  marginBottom: "15px",
  overflow: "auto",
  maxHeight: "200px"
};
const formStyle = {
  display: "flex",
  gap: "10px",
  marginBottom: "20px",
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
const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  marginTop: "20px",
  border: "1px solid #ddd",
};
const tableCellStyle = {
  border: "1px solid #ddd",
  padding: "8px",
  textAlign: "left",
};
const linkStyle = {
  color: "#4a69bd",
  textDecoration: "none",
};

export default Documents;