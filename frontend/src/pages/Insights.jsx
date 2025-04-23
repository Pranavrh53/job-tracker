import React, { useState, useEffect, useMemo } from 'react';

const Insights = () => {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    const savedJobs = JSON.parse(localStorage.getItem('jobs')) || [];
    setJobs(savedJobs);
  }, []);

  const insights = useMemo(() => {
    const responseTimes = jobs
      .filter(j => j.status === 'Interview' || j.status === 'Offer')
      .map(j => moment(j.stages?.find(s => s.stage === 'Interview')?.timestamp).diff(moment(j.dateApplied), 'days'))
      .filter(t => !isNaN(t));
    const avgResponseTime = responseTimes.length > 0
      ? (responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length).toFixed(1)
      : 'N/A';

    const successByLocation = jobs.reduce((acc, j) => {
      acc[j.location] = acc[j.location] || { total: 0, success: 0 };
      acc[j.location].total += 1;
      if (j.status === 'Offer') acc[j.location].success += 1;
      return acc;
    }, {});
    const successRates = Object.entries(successByLocation).map(([loc, data]) => ({
      location: loc,
      rate: data.total > 0 ? ((data.success / data.total) * 100).toFixed(1) : 0,
    }));

    return { avgResponseTime, successRates };
  }, [jobs]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Job Application Insights</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border p-4 rounded">
          <h2 className="text-lg font-semibold">Average Response Time</h2>
          <p>{insights.avgResponseTime} days</p>
        </div>
        <div className="border p-4 rounded">
          <h2 className="text-lg font-semibold">Success Rate by Location</h2>
          {insights.successRates.map((sr, index) => (
            <p key={index}>{sr.location}: {sr.rate}%</p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Insights;