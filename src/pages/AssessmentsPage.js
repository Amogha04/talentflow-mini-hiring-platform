// src/pages/AssessmentsPage.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Button, Spinner, Badge } from "react-bootstrap";

function AssessmentsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/api/jobs?page=1&pageSize=100&sort=order")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch jobs");
        return res.json();
      })
      .then((data) => {
        setJobs(data.jobs || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading)
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" role="status" />
        <p className="mt-3">Loading jobs...</p>
      </div>
    );

  if (error)
    return <p className="text-center text-danger mt-5">Error: {error}</p>;

  return (
    <div className="container mt-4">
      <h2 className="mb-4 text-center">Assessments Dashboard</h2>

      {jobs.length === 0 ? (
        <p className="text-center text-muted">No jobs found.</p>
      ) : (
        <div className="row g-4">
          {jobs.map((job) => (
            <div className="col-md-4 col-lg-3" key={job.id}>
              <Card className="h-100 shadow-sm">
                <Card.Body className="d-flex flex-column justify-content-between">
                  <div>
                    <Card.Title>{job.title}</Card.Title>
                    <Card.Subtitle className="text-muted small mb-2">
                      {job.slug}
                    </Card.Subtitle>
                    <Badge
                      bg={job.status === "active" ? "success" : "secondary"}
                      className="mb-3"
                    >
                      {job.status}
                    </Badge>
                  </div>
                  <Button
                    variant="primary"
                    onClick={() => navigate(`/assessments/${job.id}`)}
                  >
                    Build / View Assessment
                  </Button>
                </Card.Body>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AssessmentsPage;
