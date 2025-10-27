import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, Button, Form } from "react-bootstrap";

function AssessmentPreview() {
  const { jobId } = useParams();
  const [assessment, setAssessment] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch assessment
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

  // Handle answer changes
  const handleChange = (id, value) => {
    setAnswers({ ...answers, [id]: value });
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    const missing = assessment.builderState.questions.filter(
      (q) => q.required && !answers[q.id]
    );
    if (missing.length > 0) {
      alert(`Please fill required question(s): ${missing.map((q) => q.label).join(", ")}`);
      return;
    }

    try {
      const res = await fetch(`/api/assessments/${jobId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateId: Date.now(),
          responses: answers,
        }),
      });

      if (!res.ok) throw new Error("Submission failed");
      alert("✅ Response saved locally!");
      setAnswers({});
    } catch (err) {
      alert("Error submitting response: " + err.message);
    }
  };

  if (loading)
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" role="status" />
        <p className="mt-3">Loading assessment...</p>
      </div>
    );

  if (error)
    return <p className="text-center text-danger mt-5">Error: {error}</p>;

  if (!assessment)
    return <p className="text-center mt-5">No assessment found for this job.</p>;

  return (
    <div className="container mt-4">
      <Card className="shadow-sm">
        <Card.Body>
          <h3>{assessment.builderState.title}</h3>
          <p className="text-muted">
            Please complete all required fields and click Submit.
          </p>

          <Form onSubmit={handleSubmit}>
            {assessment.builderState.questions.map((q) => (
              <Form.Group key={q.id} className="mb-3">
                <Form.Label>
                  {q.label}{" "}
                  {q.required && <span className="text-danger">*</span>}
                </Form.Label>

                {/* Render input based on question type */}
                {q.type === "short-text" && (
                  <Form.Control
                    type="text"
                    value={answers[q.id] || ""}
                    onChange={(e) => handleChange(q.id, e.target.value)}
                  />
                )}

                {q.type === "long-text" && (
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={answers[q.id] || ""}
                    onChange={(e) => handleChange(q.id, e.target.value)}
                  />
                )}

                {q.type === "numeric" && (
                  <Form.Control
                    type="number"
                    value={answers[q.id] || ""}
                    onChange={(e) => handleChange(q.id, e.target.value)}
                  />
                )}

                {q.type === "single-choice" && (
                  <div>
                    {q.options.map((opt, idx) => (
                      <Form.Check
                        key={idx}
                        type="radio"
                        label={opt}
                        name={`q-${q.id}`}
                        checked={answers[q.id] === opt}
                        onChange={() => handleChange(q.id, opt)}
                      />
                    ))}
                  </div>
                )}

                {q.type === "multi-choice" && (
                  <div>
                    {q.options.map((opt, idx) => (
                      <Form.Check
                        key={idx}
                        type="checkbox"
                        label={opt}
                        checked={Array.isArray(answers[q.id]) && answers[q.id].includes(opt)}
                        onChange={(e) => {
                          const old = answers[q.id] || [];
                          const updated = e.target.checked
                            ? [...old, opt]
                            : old.filter((v) => v !== opt);
                          handleChange(q.id, updated);
                        }}
                      />
                    ))}
                  </div>
                )}
              </Form.Group>
            ))}

            <Button type="submit" variant="success">
              Submit
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}

export default AssessmentPreview;
