import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, Badge, Button, ListGroup } from "react-bootstrap";

function CandidateProfile() {
  const { id } = useParams();
  const [candidate, setCandidate] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Fetch candidate details ---
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/candidates?page=1&pageSize=1000`);
        const data = await res.json();
        const found = data.candidates.find(
          (c) => String(c.id) === String(id)
        );
        if (!found) throw new Error("Candidate not found");
        setCandidate(found);

        // Fetch timeline (mock or real)
        const tRes = await fetch(`/api/candidates/${id}/timeline`);
        const tData = await tRes.json();
        if (Array.isArray(tData.events)) setTimeline(tData.events);
        else
          setTimeline([
            {
              timestamp: Date.now() - 1000 * 60 * 60 * 24 * 3,
              stage: "applied",
            },
            {
              timestamp: Date.now() - 1000 * 60 * 60 * 24 * 2,
              stage: "screen",
            },
            {
              timestamp: Date.now() - 1000 * 60 * 60 * 24,
              stage: found.stage,
            },
          ]);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  if (loading)
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" role="status" />
        <p>Loading candidate...</p>
      </div>
    );

  if (error)
    return (
      <div className="text-center text-danger mt-5">
        <p>{error}</p>
        <Link to="/candidates" className="btn btn-outline-primary mt-3">
          ← Back
        </Link>
      </div>
    );

  return (
    <div className="container mt-4">
      <Card className="shadow-sm">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3>{candidate.name}</h3>
            <Link to="/candidates" className="btn btn-outline-secondary">
              ← Back to Candidates
            </Link>
          </div>
          <p className="text-muted mb-1">{candidate.email}</p>
          <Badge bg="info" className="text-uppercase">
            {candidate.stage}
          </Badge>

          <hr />
          <h5>Timeline</h5>
          <ListGroup variant="flush">
            {timeline.map((t, i) => (
              <ListGroup.Item key={i}>
                {new Date(t.timestamp).toLocaleString()} →{" "}
                <strong>{t.stage}</strong>
              </ListGroup.Item>
            ))}
          </ListGroup>

          <hr />
          <h5>Notes</h5>
          <p className="text-muted">
            @mention teammates here (feature coming soon)
          </p>
          <Button variant="outline-primary" disabled>
            Add Note
          </Button>
        </Card.Body>
      </Card>
    </div>
  );
}

export default CandidateProfile;
