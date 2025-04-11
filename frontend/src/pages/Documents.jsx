import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Documents() {
  const [file, setFile] = useState(null);
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const fetchFiles = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }

    try {
      const res = await axios.get("http://localhost:3001/api/files", {
        headers: { Authorization: `Bearer ${token}` }
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
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      await axios.post("http://localhost:3001/api/files", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });
      setFile(null);
      fetchFiles();
    } catch (err) {
      console.error("Upload File Error:", err.response || err);
      setError(err.response?.data?.message || "Failed to upload file");
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Documents</h2>
      {error && <div style={{ color: "red", marginBottom: "10px" }}>{error}</div>}
      <form onSubmit={uploadFile} style={{ marginBottom: "20px" }}>
        <input type="file" onChange={(e) => setFile(e.target.files[0])} required style={{ marginRight: "10px" }} />
        <button type="submit" style={{ padding: "5px 15px" }}>Upload</button>
      </form>
      <ul>
        {files.map((f) => (
          <li key={f.id}>
            <a href={`http://localhost:3001/${f.filepath}`} target="_blank" rel="noopener noreferrer">
              {f.filename}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Documents;