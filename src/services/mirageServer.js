import { createServer, Model, Response } from "miragejs";

export function makeServer({ environment = "development" } = {}) {
  let server = createServer({
    environment,

    models: {
      job: Model,
    },

    seeds(server) {
      server.create("job", { title: "Frontend Developer", slug: "frontend-dev", status: "active" });
      server.create("job", { title: "Backend Engineer", slug: "backend-eng", status: "archived" });
      server.create("job", { title: "UI/UX Designer", slug: "ui-ux-designer", status: "active" });
    },

    routes() {
      this.namespace = "api";

      // Simulate network delay (200–1200 ms)
      this.timing = Math.floor(Math.random() * 1000) + 200;

      // Randomly trigger an error in ~8 % of requests
      const maybeFail = () => Math.random() < 0.08;

      // ---- GET /jobs ----
      this.get("/jobs", (schema) => {
        if (maybeFail()) {
          return new Response(500, {}, { error: "Server error while fetching jobs" });
        }
        return schema.jobs.all();
      });

      // ---- POST /jobs ----
      this.post("/jobs", (schema, request) => {
        if (maybeFail()) {
          return new Response(500, {}, { error: "Server error while adding job" });
        }
        const attrs = JSON.parse(request.requestBody);
        return schema.jobs.create(attrs);
      });

      // ---- PATCH /jobs/:id ----
      this.patch("/jobs/:id", (schema, request) => {
        if (maybeFail()) {
          return new Response(500, {}, { error: "Server error while updating job" });
        }
        const newAttrs = JSON.parse(request.requestBody);
        const id = request.params.id;
        const job = schema.jobs.find(id);
        return job.update(newAttrs);
      });
    },
  });

  return server;
}
