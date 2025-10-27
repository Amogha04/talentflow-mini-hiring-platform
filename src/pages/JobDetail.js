// src/pages/JobDetail.js
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, Badge, Button } from "react-bootstrap";

export default function JobDetail() {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`/api/jobs?page=1&pageSize=100&sort=order`)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to fetch jobs");
        return r.json();
      })
      .then((data) => {
        const found = (data.jobs || []).find((j) => String(j.id) === String(jobId));
        if (!found) throw new Error("Job not found");
        setJob(found);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [jobId]);

  if (loading) return <p className="text-center mt-5">Loading...</p>;
  if (error) return <p className="text-center text-danger mt-5">{error}</p>;

  return (
    <div className="container mt-4">
      <Card>
        <Card.Body>
          <div className="d-flex justify-content-between">
            <div>
              <h3>{job.title}</h3>
              <div className="small text-muted">{job.slug}</div>
              <div className="mt-2">
                <Badge bg={job.status === "active" ? "success" : "secondary"}>{job.status}</Badge>{" "}
                {job.tags && job.tags.length > 0 && job.tags.map(t => <Badge className="ms-1" key={t}>{t}</Badge>)}
              </div>
            </div>
            <div className="text-end">
              <Link to={`/assessments/${job.id}`} className="btn btn-outline-primary btn-sm mb-2">Open Assessment</Link>
              <br />
              <Link to="/jobs" className="btn btn-outline-secondary btn-sm">Back</Link>
            </div>
          </div>
          <hr />
          <p className="text-muted">Order: {job.order}</p>
          {/* Add more fields if needed */}
        </Card.Body>
      </Card>
    </div>
  );
}
