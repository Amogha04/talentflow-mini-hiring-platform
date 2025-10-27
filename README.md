# 🧠 TalentFlow – A Mini Hiring Platform

> A fully functional HR hiring management web app built using **React**, **Bootstrap**, **MirageJS**, and **Dexie (IndexedDB)** to simulate real-world job, candidate, and assessment workflows.

---

## 🚀 Live Demo
🔗 [Live App](#) https://talentflow-mini-hiring-platform-5oowmf9id.vercel.app/
💻 [GitHub Repository](https://github.com/Amogha04/talentflow-mini-hiring-platform)

---

## 📋 Project Overview

TalentFlow is a lightweight hiring management system that allows HR teams to manage:

- **Jobs** – Create, edit, reorder, and archive job listings  
- **Candidates** – Track 1000+ candidates, search/filter, and move them between stages via a Kanban board  
- **Assessments** – Build job-specific assessments dynamically, with local persistence and validation  

Built using **React (frontend)**, **MirageJS (mock backend)**, and **IndexedDB via Dexie** for offline persistence — no real backend required.

---

## 🧩 Core Features

### 🧱 1. Jobs Module
- ✅ Create, Edit, Archive, and Unarchive Jobs  
- ✅ Server-like Pagination & Filtering by title/status  
- ✅ Drag-and-drop Reordering with optimistic UI updates & rollback on failure  
- ✅ Modal-based job creation with validation (title required, unique slug)  
- ✅ State persists using IndexedDB  
- ✅ 25 seed jobs (active + archived mix)  
- 🟡 Deep link example: `/jobs/:jobId`

---

### 👥 2. Candidates Module
- ✅ 1000 seeded candidates (randomly assigned to jobs)  
- ✅ Virtualized list using `react-window` for smooth rendering  
- ✅ Client-side search (name/email) + server-like stage filter  
- ✅ Candidate detail route `/candidates/:id` showing profile & timeline  
- ✅ Kanban board `/candidates/kanban` for drag-and-drop stage transitions  
- ✅ Local persistence through Dexie + Mirage sync  
- 🟡 Notes with @mentions (UI placeholder ready)  

---

### 📝 3. Assessments Module
- ✅ Job-specific assessment builder `/assessments/:jobId`  
- ✅ Add various question types:
  - Short Text  
  - Long Text  
  - Numeric (with range)  
  - Single Choice  
  - Multi Choice  
- ✅ Live preview as fillable form  
- ✅ Local persistence of both builder state and responses  
- ✅ Basic validation for required fields  
- 🟡 Conditional question logic (extendable)  

---

## 🗄️ Data Simulation & Persistence

| Layer | Technology | Description |
|--------|-------------|-------------|
| API Simulation | **MirageJS** | Acts as a mock REST API with artificial latency & error rates |
| Local Storage | **Dexie (IndexedDB)** | All jobs, candidates, and assessments persist locally |
| Network Latency | 200–1200ms | Randomized delay for realism |
| Error Simulation | 5–10% | Random write failures to test rollback logic |

---

## ⚙️ Technical Architecture

```
src/
├── components/               # Reusable UI components
├── pages/
│   ├── JobsPage.js           # Jobs CRUD + Reorder
│   ├── CandidatesPage.js     # List + Filters + Search
│   ├── CandidateKanban.js    # Drag & Drop between stages
│   ├── AssessmentPage.js     # Assessment builder
│   └── AssessmentsPage.js # List of assessments by job
├── services/
│   ├── mirageServer.js       # Mirage API with Dexie write-through
│   └── db.js                 # Dexie schema for local persistence
├── App.js                    # Routing & Layout
└── index.js                  # App entry + Mirage server initialization
```

**State Management:** React Hooks (`useState`, `useEffect`)  
**Styling:** React-Bootstrap + Custom CSS  
**Mock Server:** MirageJS  
**Persistence:** Dexie (IndexedDB)  
**Drag & Drop:** @hello-pangea/dnd  

---

## 🧪 Simulated API Endpoints

| Endpoint | Method | Description |
|-----------|---------|-------------|
| `/api/jobs` | GET, POST | Fetch or create jobs |
| `/api/jobs/:id` | PATCH | Update job details |
| `/api/jobs/:id/reorder` | PATCH | Reorder jobs |
| `/api/candidates` | GET, POST | List or create candidates |
| `/api/candidates/:id` | PATCH | Update candidate or move stage |
| `/api/candidates/:id/timeline` | GET | Retrieve candidate timeline |
| `/api/assessments/:jobId` | GET, PUT | Fetch or save job assessments |
| `/api/assessments/:jobId/submit` | POST | Submit candidate responses |

---

## 🧬 Seed Data
- 25 Jobs (active + archived)  
- 1000 Candidates distributed across jobs & stages  
- 3 Assessments with 10+ questions each  

---

## ⚠️ Error Handling
- Artificial latency: 200–1200 ms  
- 5–10% failure rate on writes  
- Rollback mechanism for reorder errors  

---

## 💾 Persistence Logic
All data writes flow through Mirage to Dexie:
- On first launch → Mirage seeds Dexie DB  
- On refresh → Data restored from Dexie  
- Every API update → Syncs Mirage + Dexie simultaneously  

---

## 🎨 Design & UX
- Clean HR-friendly layout via **React Bootstrap**  
- Modular pages (Jobs / Candidates / Assessments)  
- Optimistic UI for instant feedback  
- Fully local architecture — works without backend  

---

## 💡 Future Improvements
- Add rich candidate notes with @mentions  
- Add conditional visibility in assessments  
- Implement HR authentication  
- Add analytics dashboard  
- Export assessments/candidates as CSV  

---

## 🧰 Setup & Run Locally

### 1️⃣ Clone the repository
```bash
git clone https://github.com/Amogha04/talentflow-mini-hiring-platform.git
cd talentflow-mini-hiring-platform
```

### 2️⃣ Install dependencies
```bash
npm install
```

### 3️⃣ Run the app
```bash
npm start
```
App runs on **[http://localhost:3000](http://localhost:3000)**

### 4️⃣ Build for production
```bash
npm run build
```

---

## 📘 Technical Decisions & Learnings

* Used **MirageJS** to simulate REST APIs, latency, and errors  
* Used **Dexie.js** for IndexedDB-based persistence  
* Mimics a production-ready HR platform without any real backend  
* Demonstrates **rollback logic**, **drag-and-drop**, and **modular design**  
* Prioritized clean structure and readability for interview review  

---

## 👨‍💻 Developed by

**Amoghavarsha**  
🎓 B.Tech (CSE) – Final Year | Aspiring Full-Stack Developer  
💼 [GitHub Profile](https://github.com/Amogha04)

---


