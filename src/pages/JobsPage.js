import React, { useState, useEffect } from "react";
import { Button, Modal, Form, Badge, Card, InputGroup } from "react-bootstrap";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

function JobsPage() {
  // --- State management ---
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [newJob, setNewJob] = useState({ title: "", slug: "", status: "active" });

  // Filters and pagination
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, pageSize: 10 });
  const totalPages = Math.ceil(meta.total / meta.pageSize);

  // --- Fetch jobs from API ---
  const fetchJobs = () => {
    setLoading(true);
    const params = new URLSearchParams({
      search,
      status: statusFilter,
      page,
      pageSize: meta.pageSize,
      sort: "order",
    });

    fetch(`/api/jobs?${params.toString()}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load jobs");
        return res.json();
      })
      .then((data) => {
        setJobs(data.jobs || []);
        setMeta(data.meta || { total: 0, pageSize: 10 });
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchJobs();
  }, [search, statusFilter, page]);

  // --- Handle form input ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewJob({ ...newJob, [name]: value });
  };

  // --- Add Job ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newJob.title) return alert("Title is required!");

    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newJob),
      });

      if (res.status === 400) {
        const body = await res.json();
        alert(body.error || "Slug must be unique");
        return;
      }

      if (!res.ok) throw new Error("Failed to add job");
      const data = await res.json();

      setJobs([...jobs, data.job]);
      setNewJob({ title: "", slug: "", status: "active" });
      setShowModal(false);
      fetchJobs(); // refresh list
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  // --- Edit Job ---
  const handleEdit = (job) => {
    setEditingJob(job);
    setNewJob({ title: job.title, slug: job.slug, status: job.status });
    setShowModal(true);
  };

  // --- Archive / Unarchive ---
  const handleArchiveToggle = async (id) => {
    const job = jobs.find((j) => j.id === id);
    const updatedStatus = job.status === "active" ? "archived" : "active";

    const updatedJobs = jobs.map((j) =>
      j.id === id ? { ...j, status: updatedStatus } : j
    );
    setJobs(updatedJobs);

    try {
      const res = await fetch(`/api/jobs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: updatedStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
    } catch (err) {
      setJobs(jobs);
      alert("Error archiving job: " + err.message);
    }
  };

  // --- Drag-and-drop reorder ---
  const onDragEnd = async (result) => {
    if (!result.destination) return;
    const fromIndex = result.source.index;
    const toIndex = result.destination.index;
    if (fromIndex === toIndex) return;

    const oldJobs = JSON.parse(JSON.stringify(jobs));
    const updated = Array.from(jobs);
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    const reordered = updated.map((job, idx) => ({ ...job, order: idx + 1 }));
    setJobs(reordered);

    try {
      const res = await fetch(`/api/jobs/${moved.id}/reorder`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromOrder: fromIndex + 1,
          toOrder: toIndex + 1,
        }),
      });
      if (!res.ok) throw new Error("Reorder failed");
    } catch (err) {
      setJobs(oldJobs);
      alert("Reorder failed. Changes rolled back.");
    }
  };

  // --- Loading/Error state ---
  if (loading)
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" role="status" />
        <p className="mt-3">Loading jobs...</p>
      </div>
    );
  if (error) return <p className="text-center text-danger mt-5">{error}</p>;

  // --- UI ---
  return (
    <div className="container mt-4">
      <Card className="shadow-sm">
        <Card.Body>
          {/* FILTER BAR */}
          <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap">
            <h3 className="mb-2">Job Management</h3>
            <InputGroup style={{ width: "auto" }}>
              <Form.Control
                placeholder="Search jobs..."
                value={search}
                onChange={(e) => {
                  setPage(1);
                  setSearch(e.target.value);
                }}
              />
              <Form.Select
                value={statusFilter}
                onChange={(e) => {
                  setPage(1);
                  setStatusFilter(e.target.value);
                }}
              >
                <option value="">All</option>
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </Form.Select>
            </InputGroup>
            <Button variant="primary" onClick={() => setShowModal(true)}>
              + Add Job
            </Button>
          </div>

          {/* JOBS LIST */}
          {jobs.length === 0 ? (
            <p className="text-center text-muted mt-4">No jobs found.</p>
          ) : (
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="jobs">
                {(provided) => (
                  <ul
                    className="list-group"
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                  >
                    {jobs.map((job, index) => (
                      <Draggable
                        key={job.id}
                        draggableId={String(job.id)}
                        index={index}
                      >
                        {(providedDraggable) => (
                          <li
                            ref={providedDraggable.innerRef}
                            {...providedDraggable.draggableProps}
                            {...providedDraggable.dragHandleProps}
                            className="list-group-item d-flex justify-content-between align-items-center"
                          >
                            <div>
                              <strong>{job.title}</strong>{" "}
                              <Badge
                                bg={
                                  job.status === "active"
                                    ? "success"
                                    : "secondary"
                                }
                              >
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
                                  job.status === "active"
                                    ? "outline-danger"
                                    : "outline-success"
                                }
                                size="sm"
                                onClick={() => handleArchiveToggle(job.id)}
                              >
                                {job.status === "active"
                                  ? "Archive"
                                  : "Unarchive"}
                              </Button>
                            </div>
                          </li>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </ul>
                )}
              </Droppable>
            </DragDropContext>
          )}

          {/* PAGINATION */}
          <div className="d-flex justify-content-between align-items-center mt-3">
            <Button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              variant="outline-primary"
            >
              ← Previous
            </Button>
            <div>
              Page {page} of {totalPages || 1}
            </div>
            <Button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              variant="outline-primary"
            >
              Next →
            </Button>
          </div>
        </Card.Body>
      </Card>

      {/* ADD/EDIT MODAL */}
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
                required
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
                required
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
