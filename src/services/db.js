// src/services/db.js
import Dexie from "dexie";

export const db = new Dexie("TalentFlowDB");

db.version(1).stores({
  // jobs: auto-increment id, index title, slug, status, order
  jobs: "++id, title, slug, status, order",
  // candidates: id, name, email, stage, jobId
  candidates: "++id, name, email, stage, jobId",
  // assessments: id (jobId), builderState (JSON), responses (array)
  assessments: "++id, jobId",
  // timelines (optional separate store for candidate timeline events)
  timelines: "++id, candidateId, timestamp"
});
