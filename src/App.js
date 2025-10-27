import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import JobsPage from "./pages/JobsPage";
import JobDetail from "./pages/JobDetail";
import CandidatesPage from "./pages/CandidatesPage";
import CandidateProfile from "./pages/CandidateProfile";
import CandidateKanban from "./pages/CandidateKanban";
import AssessmentPage from "./pages/AssessmentPage";
import AssessmentPreview from "./pages/AssessmentPreview";

function Placeholder({ title }) {
  return <h2 className="text-center mt-5">{title} Page (Coming Soon)</h2>;
}

function App() {
  return (
    <Router>
      <div className="container mt-4">
        <nav className="nav nav-tabs justify-content-center mb-4 shadow-sm p-2 bg-white rounded">
          <Link className="nav-link" to="/jobs">
            Jobs
          </Link>
          <Link className="nav-link" to="/candidates">
            Candidates
          </Link>
          <Link className="nav-link" to="/assessments">
            Assessments
          </Link>
        </nav>

        <Routes>
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/candidates" element={<CandidatesPage />} />
           <Route path="/assessments/:jobId" element={<AssessmentPage />} />
          <Route path="*" element={<JobsPage />} />
          <Route path="/jobs/:jobId" element={<JobDetail />} />
          <Route path="/candidates/:id" element={<CandidateProfile />} />
          <Route path="/candidates/kanban" element={<CandidateKanban />} />
          <Route path="/assessments/:jobId/preview" element={<AssessmentPreview />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
