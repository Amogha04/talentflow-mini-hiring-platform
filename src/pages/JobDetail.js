import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

export default function JobDetail(){
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(()=>{
    fetch(`/api/jobs`)
      .then(r => r.json())
      .then(data => {
        const found = data.jobs.find(j => String(j.id) === String(jobId));
        if (!found) setError("Job not found");
        else setJob(found);
        setLoading(false);
      })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [jobId]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-danger">{error}</p>;

  return (
    <div className="container mt-4">
      <h3>{job.title}</h3>
      <p><strong>Slug:</strong> {job.slug}</p>
      <p><strong>Status:</strong> {job.status}</p>
      <Link to="/jobs">Back to Jobs</Link>
    </div>
  );
}
