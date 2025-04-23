import React, { useState, useEffect, useMemo } from 'react';
import Select from 'react-select';
import moment from 'moment';

const JobTable = () => {
  const [jobs, setJobs] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'dateApplied', direction: 'desc' });
  const [filters, setFilters] = useState({ status: [], location: [] });

  // Fetch jobs from the backend
  useEffect(() => {
    fetch('http://localhost:3001/api/jobs')
      .then(res => res.json())
      .then(data => setJobs(data))
      .catch(err => console.error(err));
  }, []);

  // Remove the localStorage save effect if fully switching to backend
  // useEffect(() => {
  //   localStorage.setItem('jobs', JSON.stringify(jobs));
  // }, [jobs]);

  const sortedJobs = useMemo(() => {
    let sortableJobs = [...jobs];
    if (sortConfig.key) {
      sortableJobs.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableJobs;
  }, [jobs, sortConfig]);

  const filteredJobs = useMemo(() => {
    return sortedJobs.filter(job => {
      const statusMatch = filters.status.length === 0 || filters.status.includes(job.status);
      const locationMatch = filters.location.length === 0 || filters.location.includes(job.location);
      return statusMatch && locationMatch;
    });
  }, [sortedJobs, filters]);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const statusOptions = [
    { value: 'Applied', label: 'Applied' },
    { value: 'Interview', label: 'Interview' },
    { value: 'Offer', label: 'Offer' },
    { value: 'Rejected', label: 'Rejected' },
  ];
  const locationOptions = [...new Set(jobs.map(job => job.location))].map(loc => ({
    value: loc,
    label: loc,
  }));

  const statusColors = {
    Applied: 'bg-yellow-100 text-yellow-800',
    Interview: 'bg-green-100 text-green-800',
    Offer: 'bg-blue-100 text-blue-800',
    Rejected: 'bg-red-100 text-red-800',
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-4 flex space-x-4">
        <div className="w-1/2">
          <label className="block text-sm font-medium">Status</label>
          <Select
            isMulti
            options={statusOptions}
            onChange={(selected) => setFilters({ ...filters, status: selected.map(s => s.value) })}
            className="basic-multi-select"
            classNamePrefix="select"
          />
        </div>
        <div className="w-1/2">
          <label className="block text-sm font-medium">Location</label>
          <Select
            isMulti
            options={locationOptions}
            onChange={(selected) => setFilters({ ...filters, location: selected.map(s => s.value) })}
            className="basic-multi-select"
            classNamePrefix="select"
          />
        </div>
      </div>
      <table className="min-w-full bg-white border">
        <thead>
          <tr>
            {['company', 'position', 'dateApplied', 'deadline', 'status', 'location', 'actions'].map(col => (
              <th
                key={col}
                className="px-4 py-2 border cursor-pointer"
                onClick={() => col !== 'actions' && requestSort(col)}
              >
                {col.charAt(0).toUpperCase() + col.slice(1)}
                {sortConfig.key === col && (
                  <span>{sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}</span>
                
              )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filteredJobs.map(job => (
            <tr key={job.id} className="border-t">
              <td className="px-4 py-2">{job.company}</td>
              <td className="px-4 py-2">{job.position}</td>
              <td className="px-4 py-2">{moment(job.dateApplied).format('MM/DD/YYYY')}</td>
              <td className="px-4 py-2">
                {job.deadline ? (
                  <span>
                    {moment(job.deadline).format('MM/DD/YYYY')} (
                    {moment(job.deadline).diff(moment(), 'days')} days left)
                  </span>
                ) : (
                  'N/A'
                )}
              </td>
              <td className="px-4 py-2">
                <span className={`px-2 py-1 rounded ${statusColors[job.status]}`}>
                  {job.status}
                </span>
              </td>
              <td className="px-4 py-2">{job.location}</td>
              <td className="px-4 py-2">
                <button
                  onClick={() => window.location.href = `/edit/${job.id}`}
                  className="text-blue-600 hover:underline"
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default JobTable;