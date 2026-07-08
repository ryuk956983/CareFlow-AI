# Aarogya Setu Kendra — District Health Centre & Supply Chain Command

Full-stack MERN app for the "Smart Health" brief: real-time PHC/CHC stock, bed,
footfall and doctor-attendance tracking, an AI-driven redistribution engine,
an admin panel across the whole district, and per-facility data entry.

## ⚠️ Security — do this first

The MongoDB connection string you shared in chat is now in plain text in this
conversation. Before going further:

1. In MongoDB Atlas → **Database Access**, edit the user `vermaanurag550` and
   set a **new** password.
2. Update `backend/.env` (`MONGO_URI`) with the new password.
3. Never commit `.env` to git — it's already in `.gitignore`.

The `.env` file I generated has your original string wired in so the app
works immediately, but treat that password as burned.

## Project structure

```
aarogya-setu-kendra/
  backend/     Express + Mongoose API, JWT auth, recommendation engine
  frontend/    React (Vite) + Tailwind UI
```

## 1. Backend setup

```bash
cd backend
npm install
# .env already has your Mongo URI. Rotate the password per the warning above.
npm run seed     # populates 3 sample facilities, an admin login, and 3 facility logins
npm run dev      # starts API on http://localhost:5000
```

Seeded logins (also printed by `npm run seed`):

| Role     | Username        | Password        |
|----------|-----------------|-----------------|
| Admin    | admin           | Admin@123       |
| Facility | ghatampur.chc   | Ghatampur@123   |
| Facility | rura.phc        | Rura@123        |
| Facility | bhognipur.phc   | Bhognipur@123   |

**Change these passwords before deploying anywhere public.**

## 2. Frontend setup

```bash
cd frontend
npm install
npm run dev      # starts on http://localhost:5173
```

Open `http://localhost:5173` and log in with any of the accounts above.
- **admin** sees a facility switcher and every PHC/CHC in the district.
- **facility logins** land straight on their own facility's data and cannot
  read or edit any other facility (enforced server-side, not just hidden in
  the UI).

## 3. How the AI-driven redistribution engine works

`backend/services/recommendationEngine.js` is a transparent, explainable
forecasting model (not a black box) — appropriate for a government tool
where every suggestion needs to be auditable:

1. **Demand forecast** — for every medicine at every facility, estimates
   *days of stock left* = stock on hand ÷ average daily consumption.
2. **Early warning** — flags `Critical` / `Low` / `Adequate` per medicine.
3. **Redistribution matching** — pairs facilities that have a real surplus
   of a medicine (stock well above reorder level, weeks of runway) with
   facilities facing a shortage of the *same* medicine, and recommends a
   transfer quantity, most urgent shortages first.
4. **Facility health scoring** — a composite 0–100 score from stock
   adequacy, bed pressure, and doctor attendance, used to auto-flag
   underperforming/under-resourced centres to the district admin.

See the "Redistribution & flags" tab in the UI, or `GET /api/recommendations`.

If you later want a true LLM-generated narrative on top of this (e.g. "why"
explanations in natural language), the cleanest way is to feed this
function's JSON output into a Claude API call from the backend — happy to
wire that in if you want it.

## 4. Deploying later

- **Backend**: Render, Railway, or Fly.io. Set `MONGO_URI`, `JWT_SECRET`,
  `CLIENT_ORIGIN` (your deployed frontend URL) as environment variables
  there — don't ship the `.env` file itself.
- **Frontend**: Vercel or Netlify. Set `VITE_API_URL` to your deployed
  backend's `/api` URL.
- In Atlas, add your hosting provider's IP (or `0.0.0.0/0` for quick testing,
  then tighten it) under **Network Access**.

## 5. What's included vs. what you may want to extend

Included: JWT auth (admin + per-facility), facility CRUD, medicine stock
ledger (add/edit/delete with live status), patient footfall logging + trend
chart, bed availability tracking, doctor attendance/shift roster, the
redistribution/flagging engine, and a UI matching your reference screenshots
(dark green header, tabbed navigation, card-based data tables).

Not included (flag if you want these next): Hindi/English language toggle,
multi-district support (everything currently assumes one district), SMS/email
alerts on critical stock, and an admin UI for creating facility logins (it
exists as an API endpoint `POST /api/auth/register` — just needs a form).
