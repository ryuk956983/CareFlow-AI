
# 🏥 CareFlow AI

**An AI-First Hub-and-Spoke Healthcare Operations Network for Rural India**

Built for **Google Cloud's "Build with AI: Code for Communities"** — National Hackathon
**Track 03: Smart Health**

> Solving real governance problems submitted by Indian MPs through production-ready, AI-driven infrastructure — not another CRUD dashboard.

---

## 🚨 The Problem

Rural Primary Health Centres (PHCs) and Community Health Centres (CHCs) across India face three compounding operational failures:

1. **Medicine stock-outs** — driven by manual, paper-based inventory tracking with zero forecasting.
2. **Unmanaged patient load** — unannounced doctor/staff absenteeism and unmonitored bed availability go undetected until it's too late.
3. **Zero district-wide visibility** — one PHC runs dry on a critical resource while a neighboring clinic sits on an unused surplus, because nobody can see across the network in real time.

The result: preventable shortages, wasted resources, and patients paying the price for a coordination failure — not a resource failure.

## 💡 The Solution: CareFlow AI

CareFlow AI is a **Hub-and-Spoke Healthcare Operations and Automation Network** where an AI/ML engine — not a human dispatcher — is the primary decision-maker for resource redistribution.

Instead of digitizing paperwork, CareFlow AI turns every PHC into a live telemetry node, continuously feeding a central intelligence layer that **detects shortages, calculates optimal redistribution, and routes an actionable approval to the right human — automatically.**

```
   PHC Telemetry  →  AI Dispatch & Proximity Engine  →  District Admin Approval  →  Resolved
   (low-bandwidth)     (the real "brain" of the system)     (one-click, not manual hunting)
```

---

## 🧠 How It Works — The AI-First Pipeline

### 1. Data Ingestion Layer (PHC / Remote Clinic Portal)
Ground-level PHC staff use an **optimized, low-bandwidth web app** designed for poor rural connectivity. No spreadsheets, no forms fatigue — just fast, structured telemetry:
- `+ Add Stock` / `− Reduce Stock`
- Toggle `Doctor Present / Absent`
- Live bed availability updates

Every action is a data point feeding the central intelligence engine in real time.

### 2. AI Dispatch & Proximity Engine (The Core Brain)
This is the heart of CareFlow AI — an **agentic router**, not a rules-based alert system:
- **Dynamic Threshold Monitoring Service** continuously watches stock, staffing, and bed telemetry across every connected PHC.
- The moment a resource crosses its dynamic (not static) threshold, an internal alert is raised.
- A **Proximity & Optimization Algorithm** (geospatial Haversine distance + surplus/demand matching) instantly scans the network for the nearest PHC holding a usable surplus.
- The engine auto-generates a **Transfer Manifest** — a structured payload mapping distance, quantity, urgency, and logistics — ready for human sign-off.
- **Gemini AI Diagnostics** run system-level health checks and power multilingual understanding across the stack.

### 3. Authorization Escalation Agent (One-Click Approval)
The generated transfer manifest is pushed directly into the **District Admin / CHC Dashboard** queue:
- The Admin sees a fully-reasoned AI recommendation — not raw data to interpret.
- **One-click "Approve Transfer"** locks the donor clinic's stock and confirms the transfer.
- **Multilingual SMS/WhatsApp notifications** (via Twilio + Gemini) alert both the donor and recipient PHC automatically, in their local language.

---

## 🏗️ System Architecture

```
                                   ┌───────────────────────────────────────┐
                                   │        FastAPI Backend &               │
                                   │        Telemetry Ingestion             │
                                   │  ├─ Google Gemini API (System Checks)  │
                                   │  ├─ Google Cloud Run + Cloud SQL        │
                                   │  ├─ Redis Async Queues & Worker Queues │
                                   │  ├─ Dynamic Threshold Monitoring        │
                                   │  └─ Transfer Manifest Generation        │
                                   └───────────────────┬─────────────────────┘
                                                        │
        ┌─────────────────────────┐                    │                    ┌─────────────────────────────┐
        │  PHC / Remote Clinic     │◄───────────────────┼───────────────────►│  AI Dispatch & Proximity      │
        │  Portal                  │                    │                    │  Engine (Agentic Router)      │
        │  (Low-bandwidth UI)      │       CareFlow AI   │                    │  └─ Proximity & Optimization  │
        └─────────────────────────┘       Architecture   │                    │       Algorithm                │
                                                        │                    └─────────────────────────────┘
        ┌─────────────────────────┐                    │                    ┌─────────────────────────────┐
        │  District Admin / CHC    │◄───────────────────┼───────────────────►│  Authorization Escalation     │
        │  Dashboard                │                    │                    │  Agent (Approval Flow)        │
        │  └─ Multilingual Notifs   │                    │                    │  └─ One-Click Approval &      │
        │      (SMS/WhatsApp)       │                    │                    │       Donor Locking            │
        └─────────────────────────┘                    │                    └─────────────────────────────┘
                                                        │
                                   ┌───────────────────┴─────────────────────┐
                                   │        MongoDB Atlas                     │
                                   │        (Real-Time DB + Local Cache)      │
                                   └───────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React, Tailwind CSS, shadcn/ui |
| **Backend** | FastAPI, MongoDB Atlas, Redis (async worker queues) |
| **AI / ML** | Python, Pandas, Scikit-learn (XGBoost / Random Forest), Google Gemini API |
| **Cloud / Infra** | Google Cloud Run, Cloud SQL, OAuth |
| **Messaging** | Twilio (SMS/WhatsApp) + Gemini (multilingual translation) |

---

## 📂 Repository Structure

```
CareFlow-AI/
├── backend/          # FastAPI services, ML routing engine, Redis queues, MongoDB models
├── frontend/          # React + Tailwind + shadcn/ui — role-based dashboards (PHC / CHC / District Admin)
├── package-lock.json
└── README.md
```

> Note: as the codebase grows, this structure should expand into `backend/services/`, `backend/ml/`, `frontend/src/pages/{phc,chc,admin}` etc. See **Roadmap** below.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.10+
- MongoDB Atlas connection string
- Redis instance (local or Cloud Memorystore)
- Google Cloud project with Gemini API enabled
- Twilio account (for SMS/WhatsApp notifications)

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Fill in: MONGODB_URI, REDIS_URL, GEMINI_API_KEY, TWILIO_SID, TWILIO_AUTH_TOKEN

uvicorn main:app --reload
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Environment Variables

| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `REDIS_URL` | Redis instance URL for async queues |
| `GEMINI_API_KEY` | Google Gemini API key for diagnostics & multilingual features |
| `TWILIO_SID` / `TWILIO_AUTH_TOKEN` | Twilio credentials for SMS/WhatsApp alerts |
| `GOOGLE_CLOUD_PROJECT` | GCP project ID for Cloud Run / Cloud SQL |

---

## 👥 Team — Kernel Crew

| Member | Role | Focus |
|---|---|---|
| **Neeraj Chauhan** | AI / Data Engineer & Lead | ML forecasting, proximity algorithms, Gemini API wrappers |
| **Anurag Verma** | Backend Architect | FastAPI, MongoDB, PostgreSQL schema, Redis queues, alert routing |
| **Nitin Aryan** | Frontend Engineer | Next.js, Tailwind CSS, shadcn/ui — low-bandwidth responsive dashboards |
| **Sreedharan** | Product & Full-Stack Integration | O Auth, Cloud Run deployment, multilingual APIs |

---

## 🗺️ Roadmap

- [ ] PHC telemetry ingestion API (`+/- stock`, staff presence, bed count)
- [ ] Dynamic threshold monitoring service (per-resource, per-PHC adaptive thresholds)
- [ ] Proximity & Optimization algorithm (Haversine + surplus/demand matching)
- [ ] Transfer Manifest generation + Redis queue dispatch
- [ ] District Admin dashboard — one-click approval & donor locking
- [ ] Twilio + Gemini multilingual SMS/WhatsApp notification pipeline
- [ ] Gemini-powered system diagnostics module
- [ ] Deploy to Google Cloud Run with Cloud SQL + MongoDB Atlas
- [ ] Pilot readiness: offline-first PWA support for intermittent rural connectivity

---

## 🎯 Why This Isn't "Just Another Dashboard"

Every screen in CareFlow AI exists to **surface an AI decision**, not to let a human manually search for one:
- PHC staff never analyze data — they just report state.
- District Admins never hunt for shortages — the AI already found the match and proposed the fix.
- The system's core value is the **Proximity & Optimization Algorithm** and the **Dynamic Threshold Monitoring Service** — both are active decision-making agents, not passive charts.

---

## 📄 License

This project was built for Google Cloud's "Build with AI: Code for Communities" national hackathon (Track 03: Smart Health). License to be finalized by the Kernel Crew team.
