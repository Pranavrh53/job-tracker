import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const JobForm = () => {
  const [formData, setFormData] = useState({
    company: '',
    position: '',
    dateApplied: '',
    deadline: '',
    status: 'Applied',
    location: '',
  });
  const Navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const jobs = JSON.parse(localStorage.getItem('jobs')) || [];
    const newJob = {
      id: Date.now().toString(),
      ...formData,
      dateApplied: new Date(formData.dateApplied).toISOString(),
      deadline: formData.deadline ? new Date(formData.deadline).toISOString() : null,
      stages: [{ stage: 'Applied', notes: 'Initial application', timestamp: new Date() }],
    };
    localStorage.setItem('jobs', JSON.stringify([...jobs, newJob]));
    Navigate.push('/');
  };

  return (
    <form onSubmit={handleSubmit} className="container mx-auto p-4">
      <input
        type="text"
        placeholder="Company"
        value={formData.company}
        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
        className="border p-2 mb-2 w-full"
      />
      <input
        type="text"
        placeholder="Position"
        value={formData.position}
        onChange={(e) => setFormData({ ...formData, position: e.target.value })}
        className="border p-2 mb-2 w-full"
      />
      <input
        type="date"
        value={formData.dateApplied}
        onChange={(e) => setFormData({ ...formData, dateApplied: e.target.value })}
        className="border p-2 mb-2 w-full"
      />
      <input
        type="date"
        value={formData.deadline}
        onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
        className="border p-2 mb-2 w-full"
      />
      <select
        value={formData.status}
        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
        className="border p-2 mb-2 w-full"
      >
        <option value="Applied">Applied</option>
        <option value="Interview">Interview</option>
        <option value="Offer">Offer</option>
        <option value="Rejected">Rejected</option>
      </select>
      <input
        type="text"
        placeholder="Location"
        value={formData.location}
        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
        className="border p-2 mb-2 w-full"
      />
      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
        Add Job
      </button>
    </form>
  );
};

export default JobForm; 