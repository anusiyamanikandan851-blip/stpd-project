# Antigravity Herb — Deployment Guide

This project is now wired up for a three-piece deployment:

- **Frontend** → Vercel (Vite + React)
- **Backend** → Render (Flask + gunicorn)
- **Database** → Neon (serverless Postgres)

Below is the exact, do-this-then-that sequence to get it live. Total time: ~20 minutes if env vars are ready.

---

## What changed in the code

### Backend (`backend/`)
- `config.py` — reads `DATABASE_URL` from env, auto-converts Neon's `postgres://` prefix to `postgresql://`, adds `sslmode=require`, and reads `CORS_ORIGINS` from env.
- `app.py` — restricts CORS to whitelisted origins, adds `/` and `/health` endpoints (Render's health-check), and binds to `$PORT` for production.
- `requirements.txt` — pinned versions, added `gunicorn`.
- New: `Procfile`, `runtime.txt`, `.env.example`.

### Frontend (`frontend/`)
- New: `src/config.js` — single source of truth for the API base URL, reads `VITE_API_URL`.
- All 12 files that had `http://localhost:5000` hardcoded now use `${API_URL}` and import from `config.js`.
- New: `vercel.json` (SPA rewrites), `.env.example`.

### Root
- New: `render.yaml` — Render Blueprint for one-click backend deploy.

---

## Step 1 — Set up Neon (the database)

1. Go to https://neon.tech and create a project (free tier is fine).
2. After it provisions, go to **Dashboard → Connection Details** and copy the **connection string**. It looks like:
   ```
   postgresql://username:password@ep-xxxxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
3. Save this — you'll paste it into Render in step 2.

> The code auto-fixes `postgres://` → `postgresql://` and forces `sslmode=require`, so either format from Neon works.

---

## Step 2 — Deploy the backend to Render

1. Push this repo to GitHub.
2. Go to https://render.com → **New +** → **Web Service**.
3. Connect your GitHub repo. Render will detect `render.yaml` and propose the service automatically. If it doesn't, configure manually:
   - **Root Directory:** `backend`
   - **Runtime:** Python 3
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn app:app --bind 0.0.0.0:$PORT --workers 2 --timeout 120`
   - **Health Check Path:** `/health`
4. Set these environment variables in the Render dashboard:

   | Key | Value |
   |---|---|
   | `DATABASE_URL` | Your Neon connection string from step 1 |
   | `JWT_SECRET_KEY` | Any long random string (Render can generate one) |
   | `STRIPE_SECRET_KEY` | Your Stripe secret (optional, only if using payments) |
   | `OPENROUTER_API_KEY` | Your OpenRouter key (optional, only if using chatbot) |
   | `CORS_ORIGINS` | Leave blank for now — fill in after Vercel deploy |

5. Click **Create Web Service**. First build takes ~3 minutes. When it's live, copy the URL — looks like `https://antigravity-herb-api.onrender.com`.
6. Verify by hitting `https://<your-render-url>/health` in a browser. You should see `{"status":"healthy"}`.

> The first request to a free-tier Render service after idle takes ~50s to wake up. This is normal — upgrade to Starter ($7/mo) to avoid cold starts.

### Seeding the database

After the service is live, your DB on Neon is empty. Run the seed script once:

- **Easiest way:** open Render's **Shell** tab on the service and run `python seed.py`.
- **Alternate:** locally, set `DATABASE_URL` to your Neon URL in a `.env` file, install deps, then `python seed.py`.

---

## Step 3 — Deploy the frontend to Vercel

1. Go to https://vercel.com → **Add New** → **Project** → import the same GitHub repo.
2. Configure:
   - **Root Directory:** `frontend`
   - **Framework Preset:** Vite (auto-detected)
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** `dist` (default)
3. Under **Environment Variables**, add:

   | Key | Value |
   |---|---|
   | `VITE_API_URL` | The Render URL from step 2, e.g. `https://antigravity-herb-api.onrender.com` |

4. Click **Deploy**. ~2 minutes later you'll have a URL like `https://antigravity-herb.vercel.app`.

---

## Step 4 — Wire CORS back to the frontend

The backend currently won't accept requests from your new Vercel domain. Fix this:

1. Go back to Render → your service → **Environment**.
2. Set `CORS_ORIGINS` to your Vercel URL (no trailing slash):
   ```
   CORS_ORIGINS=https://antigravity-herb.vercel.app,http://localhost:5173
   ```
   Including `localhost:5173` is optional — keep it if you also want local dev to hit prod.
3. Render will auto-redeploy. Done.

---

## Local development

Backend:
```bash
cd backend
python -m venv venv
source venv/bin/activate    # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env        # then fill in your values (or leave DATABASE_URL blank to use SQLite)
python app.py
```

Frontend:
```bash
cd frontend
npm install
cp .env.example .env        # set VITE_API_URL=http://localhost:5000 for local backend
npm run dev
```

---

## Troubleshooting

**CORS error in browser console** → `CORS_ORIGINS` on Render doesn't include your Vercel URL. Check for trailing slashes and `https://` vs `http://`.

**`relation "user" does not exist`** → DB is empty. Run `python seed.py` from Render Shell.

**Backend returns 502 / takes 50s** → Render free tier cold start. Hit `/health` once to wake it, or upgrade plan.

**`sqlalchemy.exc.NoSuchModuleError: postgres`** → Old SQLAlchemy with `postgres://`. The code auto-fixes this; make sure you deployed the updated `config.py`.

**Frontend builds but API calls fail** → `VITE_API_URL` not set in Vercel, or set without `https://`. Vite env vars must be set at **build time**, so re-deploy after adding/changing them.

---

## File checklist

```
backend/
├── app.py              ← updated (CORS, /health, $PORT)
├── config.py           ← updated (Neon URL handling, CORS_ORIGINS)
├── requirements.txt    ← updated (pinned + gunicorn)
├── Procfile            ← new
├── runtime.txt         ← new
├── .env.example        ← new
├── .gitignore          ← new
└── ... (rest unchanged)

frontend/
├── src/
│   ├── config.js       ← new
│   └── ... (12 files updated to import API_URL)
├── vercel.json         ← new
├── .env.example        ← new
└── ... (rest unchanged)

render.yaml             ← new (root)
```
