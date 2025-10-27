import React, { useState, useEffect } from "react";
import { Card, Badge } from "react-bootstrap";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const STAGES = ["applied", "screen", "tech", "offer", "hired", "rejected"];

function CandidateKanban() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Fetch all candidates on mount ---
  useEffect(() => {
    fetch("/api/candidates?page=1&pageSize=1000")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load candidates");
        return res.json();
      })
      .then((data) => {
        setCandidates(data.candidates || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // --- Group candidates by stage ---
  const grouped = STAGES.reduce((acc, stage) => {
    acc[stage] = candidates.filter((c) => c.stage === stage);
    return acc;
  }, {});

  // --- Handle drag and drop ---
  const onDragEnd = async (result) => {
    const { source, destination } = result;
    if (!destination) return;

    const fromStage = source.droppableId;
    const toStage = destination.droppableId;

    if (fromStage === toStage) return;

    const candidate = grouped[fromStage][source.index];

    // Optimistic update
    const updatedCandidates = candidates.map((c) =>
      c.id === candidate.id ? { ...c, stage: toStage } : c
    );
    setCandidates(updatedCandidates);

    try {
      const res = await fetch(`/api/candidates/${candidate.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: toStage }),
      });

      if (!res.ok) throw new Error("Failed to update candidate stage");
    } catch (err) {
      // Rollback
      setCandidates(candidates);
      alert("Error moving candidate: " + err.message);
    }
  };

  if (loading)
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" role="status" />
        <p className="mt-3">Loading candidates...</p>
      </div>
    );

  if (error)
    return <p className="text-center text-danger mt-5">{error}</p>;

  // --- UI ---
  return (
    <div className="container-fluid mt-4">
      <h3 className="text-center mb-4">Candidate Stages (Kanban Board)</h3>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="d-flex overflow-auto" style={{ gap: "1rem" }}>
          {STAGES.map((stage) => (
            <Droppable droppableId={stage} key={stage}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="p-3 border rounded bg-light"
                  style={{
                    minWidth: "250px",
                    flex: "0 0 auto",
                    height: "80vh",
                    overflowY: "auto",
                  }}
                >
                  <h5 className="text-center text-capitalize mb-3">
                    {stage}{" "}
                    <Badge bg="secondary">
                      {grouped[stage]?.length || 0}
                    </Badge>
                  </h5>
                  {grouped[stage]?.map((c, index) => (
                    <Draggable
                      key={c.id}
                      draggableId={String(c.id)}
                      index={index}
                    >
                      {(providedDraggable) => (
                        <Card
                          ref={providedDraggable.innerRef}
                          {...providedDraggable.draggableProps}
                          {...providedDraggable.dragHandleProps}
                          className="mb-3 shadow-sm"
                        >
                          <Card.Body>
                            <strong>{c.name}</strong>
                            <div className="small text-muted">
                              {c.email}
                            </div>
                          </Card.Body>
                        </Card>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}

export default CandidateKanban;
