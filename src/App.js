import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

function JobsPage() {
  return <h2 className="text-center mt-5">Jobs Page</h2>;
}

function CandidatesPage() {
  return <h2 className="text-center mt-5">Candidates Page</h2>;
}

function AssessmentsPage() {
  return <h2 className="text-center mt-5">Assessments Page</h2>;
}

function App() {
  return (
    <Router>
      <div className="container mt-3">
        <nav className="nav nav-tabs">
          <Link className="nav-link" to="/jobs">Jobs</Link>
          <Link className="nav-link" to="/candidates">Candidates</Link>
          <Link className="nav-link" to="/assessments">Assessments</Link>
        </nav>

        <Routes>
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/candidates" element={<CandidatesPage />} />
          <Route path="/assessments" element={<AssessmentsPage />} />
          <Route path="*" element={<JobsPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
