import React, { useState } from "react";
import { Button, Modal, Form, Badge, Card } from "react-bootstrap";

function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [newJob, setNewJob] = useState({ title: "", slug: "", status: "active" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewJob({ ...newJob, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newJob.title) return alert("Title is required!");

    if (editingJob) {
      const updatedJobs = jobs.map((job) =>
        job.id === editingJob.id ? { ...editingJob, ...newJob } : job
      );
      setJobs(updatedJobs);
      setEditingJob(null);
    } else {
      const newEntry = {
        id: Date.now(),
        ...newJob,
      };
      setJobs([...jobs, newEntry]);
    }

    setNewJob({ title: "", slug: "", status: "active" });
    setShowModal(false);
  };

  const handleEdit = (job) => {
    setEditingJob(job);
    setNewJob({ title: job.title, slug: job.slug, status: job.status });
    setShowModal(true);
  };

  const handleArchiveToggle = (id) => {
    setJobs(
      jobs.map((job) =>
        job.id === id
          ? {
              ...job,
              status: job.status === "active" ? "archived" : "active",
            }
          : job
      )
    );
  };

  return (
    <div className="container mt-4">
      <Card className="shadow-sm">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3 className="mb-0">Job Management</h3>
            <Button variant="primary" onClick={() => setShowModal(true)}>
              + Add Job
            </Button>
          </div>

          {jobs.length === 0 ? (
            <p className="text-center text-muted mt-4">No jobs created yet.</p>
          ) : (
            <ul className="list-group">
              {jobs.map((job) => (
                <li
                  key={job.id}
                  className="list-group-item d-flex justify-content-between align-items-center"
                >
                  <div>
                    <strong>{job.title}</strong>{" "}
                    <Badge bg={job.status === "active" ? "success" : "secondary"}>
                      {job.status}
                    </Badge>
                    <div className="small text-muted">{job.slug}</div>
                  </div>
                  <div>
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => handleEdit(job)}
                    >
                      Edit
                    </Button>{" "}
                    <Button
                      variant={
                        job.status === "active" ? "outline-danger" : "outline-success"
                      }
                      size="sm"
                      onClick={() => handleArchiveToggle(job.id)}
                    >
                      {job.status === "active" ? "Archive" : "Unarchive"}
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card.Body>
      </Card>

      {/* Add/Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editingJob ? "Edit Job" : "Add Job"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={newJob.title}
                onChange={handleChange}
                placeholder="Enter job title"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Slug</Form.Label>
              <Form.Control
                type="text"
                name="slug"
                value={newJob.slug}
                onChange={handleChange}
                placeholder="unique-job-slug"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select
                name="status"
                value={newJob.status}
                onChange={handleChange}
              >
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </Form.Select>
            </Form.Group>

            <Button variant="success" type="submit">
              {editingJob ? "Update" : "Save"}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default JobsPage;
