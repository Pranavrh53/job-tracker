import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { useParams } from 'react-router-dom';

const JobEdit = () => {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [newStage, setNewStage] = useState({ stage: '', notes: '', timestamp: new Date() });

  useEffect(() => {
    const jobs = JSON.parse(localStorage.getItem('jobs')) || [];
    const foundJob = jobs.find(j => j.id === id);
    setJob(foundJob || {});
  }, [id]);

  const addStage = () => {
    if (!newStage.stage) return;
    const updatedJob = {
      ...job,
      stages: [...(job.stages || []), { ...newStage, timestamp: new Date() }],
    };
    const jobs = JSON.parse(localStorage.getItem('jobs')) || [];
    const updatedJobs = jobs.map(j => (j.id === id ? updatedJob : j));
    localStorage.setItem('jobs', JSON.stringify(updatedJobs));
    setJob(updatedJob);
    setNewStage({ stage: '', notes: '', timestamp: new Date() });
  };

  if (!job) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{job.company} - {job.position}</h1>
      <div className="mb-4">
        <h2 className="text-xl font-semibold">Application Stages</h2>
        <div className="mt-2">
          {(job.stages || []).map((stage, index) => (
            <div key={index} className="border p-2 mb-2 rounded">
              <p><strong>Stage:</strong> {stage.stage}</p>
              <p><strong>Notes:</strong> {stage.notes}</p>
              <p><strong>Timestamp:</strong> {moment(stage.timestamp).format('MM/DD/YYYY HH:mm')}</p>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <h3 className="text-lg font-medium">Add New Stage</h3>
          <input
            type="text"
            placeholder="Stage (e.g., Phone Screen)"
            value={newStage.stage}
            onChange={(e) => setNewStage({ ...newStage, stage: e.target.value })}
            className="border p-2 mr-2"
          />
          <input
            type="text"
            placeholder="Notes"
            value={newStage.notes}
            onChange={(e) => setNewStage({ ...newStage, notes: e.target.value })}
            className="border p-2 mr-2"
          />
          <button
            onClick={addStage}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Add Stage
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobEdit;