// src/services/mirageServer.js
import { createServer, Model, Response } from "miragejs";
import { db } from "./db";
import { v4 as uuidv4 } from "uuid";

/**
 * makeServer now async to await Dexie reads before seeding Mirage
 */
export async function makeServer({ environment = "development" } = {}) {
  // load from IndexedDB
  let storedJobs = await db.jobs.toArray();
  let storedCandidates = await db.candidates.toArray();
  let storedAssessments = await db.assessments.toArray();

  // If jobs not seeded, create 25 jobs
  if (storedJobs.length === 0) {
    storedJobs = Array.from({ length: 25 }).map((_, i) => {
      const title = [
        "Frontend Developer","Backend Engineer","UI/UX Designer","QA Engineer","Product Manager",
        "Mobile Developer","Data Engineer","DevOps Engineer","Fullstack Developer","SRE",
        "Data Scientist","Security Engineer","Technical Writer","Support Engineer","Customer Success",
        "Machine Learning Eng","Site Reliability Eng","Business Analyst","Frontend Intern",
        "Backend Intern","AI Researcher","Cloud Engineer","Platform Engineer","System Architect",
        "Engineering Manager"
      ][i % 25] + (i >= 12 ? ` ${i+1}` : "");
      const slug = title.toLowerCase().replace(/\s+/g, "-") + "-" + (i+1);
      const status = Math.random() < 0.7 ? "active" : "archived";
      return { title, slug, status, order: i + 1 };
    });
    await db.jobs.bulkAdd(storedJobs);
  }

  // If candidates not seeded, create 1000 candidates randomly assigned
  if (storedCandidates.length === 0) {
    const stages = ["applied","screen","tech","offer","hired","rejected"];
    const candidates = [];
    for (let i = 0; i < 1000; i++) {
      const name = `Candidate ${i+1}`;
      const email = `candidate${i+1}@example.com`;
      const jobId = Math.floor(Math.random() * storedJobs.length) + 1; // job id approx
      const stage = stages[Math.floor(Math.random() * stages.length)];
      candidates.push({ name, email, stage, jobId });
    }
    await db.candidates.bulkAdd(candidates);
    storedCandidates = await db.candidates.toArray();
  }

  // If assessments not seeded, create 3 assessments with 10+ questions each
  if (storedAssessments.length === 0) {
    const assessments = Array.from({ length: 3 }).map((_, idx) => {
      const jobId = idx + 1;
      const questions = Array.from({ length: 10 }).map((q, qi) => ({
        id: uuidv4(),
        type: ["single-choice","multi-choice","short-text","long-text","numeric"][qi % 5],
        label: `Q${qi+1} for job ${jobId}`,
        required: qi % 3 === 0,
        options: (qi % 5 === 0 || qi % 5 === 1) ? ["Option A","Option B","Option C"] : undefined,
        conditional: null
      }));
      return { jobId, builderState: { title: `Assessment for job ${jobId}`, questions }, responses: [] };
    });
    await db.assessments.bulkAdd(assessments);
    storedAssessments = await db.assessments.toArray();
  }

  // Now create Mirage server with these stored data
  let server = createServer({
    environment,
    models: {
      job: Model,
      candidate: Model,
      assessment: Model
    },
    seeds(server) {
      // seed jobs
      storedJobs.forEach((j) => server.create("job", j));
      // seed candidates
      storedCandidates.forEach((c) => server.create("candidate", c));
      // seed assessments
      storedAssessments.forEach((a) => server.create("assessment", a));
    },

    routes() {
      this.namespace = "api";

      // network latency (200-1200ms)
      this.timing = Math.floor(Math.random() * 1000) + 200;
      const maybeFail = (rate = 0.08) => Math.random() < rate; // default 8%

      // -------- JOBS --------
      // GET /jobs?search=&status=&page=&pageSize=&sort=
      this.get("/jobs", (schema, request) => {
        if (maybeFail(0.05)) {
          // small chance read fails
          return new Response(500, {}, { error: "Failed to fetch jobs" });
        }
        const { search = "", status = "", page = "1", pageSize = "10", sort = "order" } = request.queryParams;
        let jobs = schema.jobs.all().models;

        // filter by search (title or slug)
        if (search) {
          const q = search.toLowerCase();
          jobs = jobs.filter(j => (j.title && j.title.toLowerCase().includes(q)) || (j.slug && j.slug.toLowerCase().includes(q)));
        }
        // filter by status
        if (status) {
          jobs = jobs.filter(j => j.status === status);
        }
        // sort
        if (sort === "title") jobs = jobs.sort((a,b)=> a.title.localeCompare(b.title));
        else jobs = jobs.sort((a,b)=> (a.order || 0) - (b.order || 0));

        const p = Number(page) || 1;
        const ps = Number(pageSize) || 10;
        const total = jobs.length;
        const start = (p - 1) * ps;
        const paged = jobs.slice(start, start + ps);

        return { jobs: paged, meta: { total, page: p, pageSize: ps } };
      });

      // POST /jobs -> validate unique slug
      this.post("/jobs", async (schema, request) => {
        if (maybeFail(0.08)) return new Response(500, {}, { error: "Server error while adding job" });
        const attrs = JSON.parse(request.requestBody);

        // unique slug validation
        const exists = schema.jobs.all().models.find(j => j.slug === attrs.slug);
        if (exists) {
          return new Response(400, {}, { error: "Slug must be unique" });
        }

        // set order as last
        const allJobs = schema.jobs.all().models;
        const maxOrder = allJobs.reduce((m, j) => Math.max(m, j.order || 0), 0);
        const newJob = { ...attrs, order: (attrs.order || maxOrder + 1) };

        const job = schema.jobs.create(newJob);
        await db.jobs.add(job.attrs);
        return { job };
      });

      // PATCH /jobs/:id
      this.patch("/jobs/:id", async (schema, request) => {
        if (maybeFail(0.08)) return new Response(500, {}, { error: "Server error while updating job" });
        const id = request.params.id;
        const attrs = JSON.parse(request.requestBody);

        // If slug is being updated, ensure uniqueness
        if (attrs.slug) {
          const other = schema.jobs.all().models.find(j => j.slug === attrs.slug && String(j.id) !== String(id));
          if (other) return new Response(400, {}, { error: "Slug must be unique" });
        }

        const job = schema.jobs.find(id);
        job.update(attrs);
        await db.jobs.put({ id: Number(id), ...job.attrs });
        return { job };
      });

      // PATCH /jobs/:id/reorder -> robust single implementation
      this.patch("/jobs/:id/reorder", async (schema, request) => {
        // simulate occasional 10% failure for reorder (to test rollback)
        if (maybeFail(0.10)) {
          return new Response(500, {}, { error: "Temporary error while reordering" });
        }

        // parse body
        const { fromOrder, toOrder } = JSON.parse(request.requestBody);

        // get all jobs sorted by current order
        const jobs = schema.jobs.all().models.sort((a,b) => (a.order || 0) - (b.order || 0));

        // find index of moving job by fromOrder (1-based order)
        const movingIndex = jobs.findIndex(j => Number(j.order) === Number(fromOrder));
        if (movingIndex === -1) {
          return new Response(400, {}, { error: "Invalid fromOrder" });
        }

        // remove the moving job
        const [movingJob] = jobs.splice(movingIndex, 1);

        // calculate insertion index (0-based)
        const insertIndex = Math.max(0, Math.min(jobs.length, Number(toOrder) - 1));

        // insert moving job at new position
        jobs.splice(insertIndex, 0, movingJob);

        // reassign orders and persist to Dexie
        for (let idx = 0; idx < jobs.length; idx++) {
          const j = jobs[idx];
          const newOrder = idx + 1;
          // update Mirage model
          const model = schema.jobs.find(j.id);
          model.update({ order: newOrder });
          // persist in IndexedDB (Dexie)
          await db.jobs.put({ id: Number(model.id), title: model.title, slug: model.slug, status: model.status, order: newOrder });
        }

        return { ok: true };
      });

      // -------- CANDIDATES --------
      // GET /candidates?search=&stage=&page=
      this.get("/candidates", (schema, request) => {
        const { search = "", stage = "", page = "1", pageSize = "20" } = request.queryParams;
        let items = schema.candidates.all().models;

        if (search) {
          const q = search.toLowerCase();
          items = items.filter(c => (c.name && c.name.toLowerCase().includes(q)) || (c.email && c.email.toLowerCase().includes(q)));
        }
        if (stage) items = items.filter(c => c.stage === stage);

        const p = Number(page) || 1;
        const ps = Number(pageSize) || 20;
        const total = items.length;
        const start = (p - 1) * ps;
        const paged = items.slice(start, start + ps);
        return { candidates: paged, meta: { total, page: p, pageSize: ps } };
      });

      // POST /candidates
      this.post("/candidates", async (schema, request) => {
        if (maybeFail(0.08)) return new Response(500, {}, { error: "Server error while creating candidate" });
        const attrs = JSON.parse(request.requestBody);
        const candidate = schema.candidates.create(attrs);
        await db.candidates.add(candidate.attrs);
        return { candidate };
      });

      // PATCH /candidates/:id (stage transitions)
      this.patch("/candidates/:id", async (schema, request) => {
        if (maybeFail(0.08)) return new Response(500, {}, { error: "Server error while updating candidate" });
        const id = request.params.id;
        const attrs = JSON.parse(request.requestBody);
        const cand = schema.candidates.find(id);
        cand.update(attrs);
        await db.candidates.put({ id: Number(id), ...cand.attrs });
        // write timeline event
        await db.timelines.add({ candidateId: Number(id), timestamp: Date.now(), event: attrs });
        return { candidate: cand };
      });

      // GET /candidates/:id/timeline
      this.get("/candidates/:id/timeline", (schema, request) => {
        const id = Number(request.params.id);
        // return indication that timeline is stored locally; client can read Dexie directly
        return { timelineKey: "stored-locally" };
      });

      // -------- ASSESSMENTS --------
      // GET /assessments/:jobId
      this.get("/assessments/:jobId", (schema, request) => {
        const jobId = Number(request.params.jobId);
        const found = schema.assessments.all().models.find(a => Number(a.jobId) === jobId);
        if (found) return { assessment: found.attrs };
        return new Response(404, {}, { error: "Not found" });
      });

      // PUT /assessments/:jobId (save builder state)
      this.put("/assessments/:jobId", async (schema, request) => {
        if (maybeFail(0.08)) return new Response(500, {}, { error: "Server write error" });
        const jobId = Number(request.params.jobId);
        const payload = JSON.parse(request.requestBody);
        let rec = schema.assessments.all().models.find(a => Number(a.jobId) === jobId);
        if (rec) {
          rec.update({ builderState: payload.builderState });
          await db.assessments.put({ id: Number(rec.id), jobId, builderState: payload.builderState, responses: rec.responses || [] });
        } else {
          const created = schema.assessments.create({ jobId, builderState: payload.builderState, responses: [] });
          await db.assessments.add(created.attrs);
        }
        return { ok: true };
      });

      // POST /assessments/:jobId/submit
      this.post("/assessments/:jobId/submit", async (schema, request) => {
        if (maybeFail(0.08)) return new Response(500, {}, { error: "Server write error" });
        const jobId = Number(request.params.jobId);
        const payload = JSON.parse(request.requestBody); // { candidateId, responses }
        const rec = schema.assessments.all().models.find(a => Number(a.jobId) === jobId);
        if (!rec) return new Response(404, {}, { error: "Not found" });
        const responseRecord = { id: uuidv4(), ...payload, submittedAt: Date.now() };
        const stored = rec.responses || [];
        stored.push(responseRecord);
        rec.update({ responses: stored });
        await db.assessments.put({ id: Number(rec.id), jobId, builderState: rec.builderState, responses: stored });
        return { ok: true, response: responseRecord };
      });
    }
  });

  return server;
}
