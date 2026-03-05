# QuickQuotesUSA — Launch Guide
## $0/month · Live in ~20 minutes

---

## STEP 1 — Set Up Supabase (5 min)

1. Go to https://supabase.com/dashboard
2. Click **New Project** → name it `quickquotesusa`
3. Choose a region close to your users (e.g. US East)
4. Wait ~2 minutes for it to spin up

### Run the database schema:
1. In your project, click **SQL Editor** in the left sidebar
2. Click **New Query**
3. Open the file `supabase_schema.sql` from this folder
4. Paste the entire contents and click **Run**
5. You should see "Success. No rows returned."

### Get your API keys:
1. Go to **Settings → API** in your Supabase project
2. Copy your **Project URL** → looks like `https://abcxyz.supabase.co`
3. Copy your **anon/public** key → a long string starting with `eyJ...`

---

## STEP 2 — Configure the App (2 min)

1. In the project folder, copy `.env.example` → `.env.local`
   ```
   cp .env.example .env.local
   ```

2. Open `.env.local` and paste your credentials:
   ```
   VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...your_anon_key...
   ```

---

## STEP 3 — Run Locally (2 min)

```bash
npm install
npm run dev
```

Open http://localhost:5173 — the app is running!

**Test it:**
- Create a homeowner account
- Create a contractor account (different email)
- Post a job as the homeowner
- Submit a bid as the contractor
- Accept the bid as the homeowner

---

## STEP 4 — Deploy to Vercel (5 min)

### Option A — GitHub (recommended)

1. Push to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial QuickQuotesUSA MVP"
   git remote add origin https://github.com/YOUR_USERNAME/quickquotesusa.git
   git push -u origin main
   ```

2. Go to https://vercel.com/new
3. Click **Import Git Repository** → select your repo
4. Under **Environment Variables**, add:
   - `VITE_SUPABASE_URL` = your Supabase URL
   - `VITE_SUPABASE_ANON_KEY` = your anon key
5. Click **Deploy**

Your app will be live at `https://quickquotesusa.vercel.app` in ~60 seconds.

### Option B — Vercel CLI

```bash
npm install -g vercel
vercel
```

---

## STEP 5 — Custom Domain (optional)

1. In Vercel dashboard → your project → **Settings → Domains**
2. Add `quickquotesusa.com`
3. Update DNS records as instructed — SSL is automatic and free

---

## File Structure

```
QuickQuotesUSA/
├── src/
│   ├── App.jsx              ← Main app (all pages + UI)
│   └── lib/
│       └── supabase.js      ← All database functions
├── index.html
├── package.json
├── vite.config.js
├── vercel.json
├── .env.example
├── .env.local               ← Your actual keys (never commit!)
└── supabase_schema.sql      ← Database setup script
```

---

## Costs by Stage

| Stage | Users | Monthly Cost |
|---|---|---|
| MVP / Testing | 0–100 | **$0** |
| Early launch | 100–1,000 | **$0** |
| Growing | 1,000–10,000 | **~$25** |
| Scaling | 10,000+ | **~$75–150** |
