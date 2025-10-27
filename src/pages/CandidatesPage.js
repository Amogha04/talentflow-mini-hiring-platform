import React, { useState, useEffect } from "react";
import { Card, Form, InputGroup, Badge, Button } from "react-bootstrap";

function CandidatesPage() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, pageSize: 50 });

  // --- Fetch candidates ---
  const fetchCandidates = () => {
    setLoading(true);
    const params = new URLSearchParams({
      search,
      stage: stageFilter,
      page,
      pageSize: meta.pageSize,
    });

    fetch(`/api/candidates?${params.toString()}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch candidates");
        return res.json();
      })
      .then((data) => {
        setCandidates(data?.candidates || []);
        setMeta(data?.meta || { total: 0, pageSize: 50 });
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCandidates();
  }, [search, stageFilter, page]);

  if (loading)
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" role="status" />
        <p className="mt-3">Loading candidates...</p>
      </div>
    );

  if (error)
    return <p className="text-center text-danger mt-5">Error: {error}</p>;

  return (
    <div className="container mt-4">
      <Card className="shadow-sm">
        <Card.Body>
          {/* --- Header & Controls --- */}
          <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap">
            <h3 className="mb-2">Candidates</h3>

            <div className="d-flex gap-2">
              <InputGroup style={{ width: "auto" }}>
                <Form.Control
                  placeholder="Search by name or email..."
                  value={search}
                  onChange={(e) => {
                    setPage(1);
                    setSearch(e.target.value);
                  }}
                />
                <Form.Select
                  value={stageFilter}
                  onChange={(e) => {
                    setPage(1);
                    setStageFilter(e.target.value);
                  }}
                >
                  <option value="">All Stages</option>
                  <option value="applied">Applied</option>
                  <option value="screen">Screen</option>
                  <option value="tech">Tech</option>
                  <option value="offer">Offer</option>
                  <option value="hired">Hired</option>
                  <option value="rejected">Rejected</option>
                </Form.Select>
              </InputGroup>

              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => (window.location.href = "/candidates/kanban")}
              >
                View Kanban Board
              </Button>
            </div>
          </div>

          {/* --- Candidates List --- */}
          {candidates.length > 0 ? (
            <div style={{ maxHeight: 600, overflowY: "auto", border: "1px solid #ddd" }}>
              {candidates.map((candidate) => (
                <div
                  key={candidate.id}
                  className="d-flex justify-content-between align-items-center border-bottom px-3 py-2 candidate-row"
                  onClick={() =>
                    (window.location.href = `/candidates/${candidate.id}`)
                  }
                  style={{ cursor: "pointer" }}
                >
                  <div>
                    <strong>{candidate.name}</strong>
                    <div className="text-muted small">{candidate.email}</div>
                  </div>
                  <Badge bg="info" className="text-uppercase">
                    {candidate.stage}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted mt-4">No candidates found.</p>
          )}

          {/* --- Pagination --- */}
          <div className="d-flex justify-content-center mt-3 gap-2">
            <Button
              variant="outline-secondary"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline-secondary"
              size="sm"
              disabled={page * meta.pageSize >= meta.total}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}

export default CandidatesPage;
