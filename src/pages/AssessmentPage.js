import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, Button, Form } from "react-bootstrap";

function AssessmentPage() {
  const { jobId } = useParams();
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Fetch existing assessment ---
  useEffect(() => {
    fetch(`/api/assessments/${jobId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load assessment");
        return res.json();
      })
      .then((data) => {
        setAssessment(data.assessment);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [jobId]);

  // --- Loading/Error states ---
  if (loading)
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" role="status" />
        <p className="mt-3">Loading assessment...</p>
      </div>
    );

  if (error)
    return <p className="text-center text-danger mt-5">Error: {error}</p>;

  // --- Create new assessment if not found ---
  if (!assessment)
    return (
      <div className="text-center mt-5">
        <p>No assessment found for this job.</p>
        <Button
          variant="primary"
          onClick={() =>
            setAssessment({
              jobId,
              builderState: { title: `Assessment for Job ${jobId}`, questions: [] },
              responses: [],
            })
          }
        >
          Create New Assessment
        </Button>
      </div>
    );

  // --- Add new question ---
  const addQuestion = (type) => {
    const newQuestion = {
      id: Date.now(),
      type,
      label: `New ${type} question`,
      required: false,
      options:
        type === "single-choice" || type === "multi-choice"
          ? ["Option A", "Option B"]
          : [],
    };
    const updated = {
      ...assessment,
      builderState: {
        ...assessment.builderState,
        questions: [...assessment.builderState.questions, newQuestion],
      },
    };
    setAssessment(updated);
  };

  // --- Update question ---
  const updateQuestion = (id, key, value) => {
    const updatedQuestions = assessment.builderState.questions.map((q) =>
      q.id === id ? { ...q, [key]: value } : q
    );
    setAssessment({
      ...assessment,
      builderState: { ...assessment.builderState, questions: updatedQuestions },
    });
  };

  // --- Delete question ---
  const deleteQuestion = (id) => {
    if (!window.confirm("Delete this question?")) return;
    const updatedQuestions = assessment.builderState.questions.filter(
      (q) => q.id !== id
    );
    setAssessment({
      ...assessment,
      builderState: { ...assessment.builderState, questions: updatedQuestions },
    });
  };

  // --- Save Assessment ---
  const saveAssessment = async () => {
    try {
      const res = await fetch(`/api/assessments/${jobId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ builderState: assessment.builderState }),
      });
      if (!res.ok) throw new Error("Failed to save assessment");
      alert("✅ Assessment saved successfully!");
    } catch (err) {
      alert("Error saving: " + err.message);
    }
  };

  return (
    <div className="container mt-4">
      <Card className="shadow-sm">
        <Card.Body>
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3>{assessment.builderState.title}</h3>
            <Button variant="success" onClick={saveAssessment}>
              💾 Save
            </Button>
          </div>

          {/* Add Question Toolbar */}
          <div className="mb-3">
            <Form.Label>Add Question</Form.Label>
            <div className="d-flex flex-wrap gap-2">
              {[
                "short-text",
                "long-text",
                "numeric",
                "single-choice",
                "multi-choice",
              ].map((type) => (
                <Button
                  key={type}
                  variant="outline-primary"
                  size="sm"
                  onClick={() => addQuestion(type)}
                >
                  + {type}
                </Button>
              ))}
            </div>
          </div>

          <hr />

          {/* Questions List */}
          <div>
            <h5>🧾 Questions Builder</h5>
            {assessment.builderState.questions.length === 0 ? (
              <p className="text-muted">No questions added yet.</p>
            ) : (
              assessment.builderState.questions.map((q) => (
                <Card key={q.id} className="mb-3 p-3">
                  <div className="d-flex justify-content-between align-items-start">
                    <div style={{ flex: 1 }}>
                      <Form.Group className="mb-2">
                        <Form.Label>Question Label</Form.Label>
                        <Form.Control
                          type="text"
                          value={q.label}
                          onChange={(e) =>
                            updateQuestion(q.id, "label", e.target.value)
                          }
                        />
                      </Form.Group>

                      <Form.Group className="mb-2">
                        <Form.Label>Type</Form.Label>
                        <Form.Control
                          value={q.type}
                          readOnly
                          disabled
                          className="bg-light"
                        />
                      </Form.Group>

                      {["single-choice", "multi-choice"].includes(q.type) && (
                        <Form.Group className="mb-2">
                          <Form.Label>Options</Form.Label>
                          <Form.Control
                            type="text"
                            value={q.options.join(", ")}
                            onChange={(e) =>
                              updateQuestion(q.id, "options", e.target.value.split(","))
                            }
                          />
                          <Form.Text className="text-muted">
                            Comma-separated options
                          </Form.Text>
                        </Form.Group>
                      )}

                      <Form.Check
                        type="checkbox"
                        label="Required"
                        checked={q.required}
                        onChange={(e) =>
                          updateQuestion(q.id, "required", e.target.checked)
                        }
                      />
                    </div>

                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => deleteQuestion(q.id)}
                    >
                      🗑 Delete
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}

export default AssessmentPage;
