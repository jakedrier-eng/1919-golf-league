# 1919-golf-league
# ⛳ League Captain — Golf League Manager

A mobile-first web app for managing your golf league roster, weekly matchups, and season standings — with AI-powered matchup suggestions.

-----

## 📁 Repo Structure

```
golf-league/
├── api/
│   └── matchups.js       ← Vercel serverless function (keeps API key secret)
├── public/
│   └── favicon.svg
├── src/
│   ├── main.jsx
│   └── App.jsx           ← Full app
├── index.html
├── package.json
├── vite.config.js
├── vercel.json
└── .gitignore
```

-----

## 🚀 Deploy to Vercel (step by step)

### Step 1 — Create a GitHub repo

1. Go to [github.com](https://github.com) and sign in
1. Click **“New repository”**
1. Name it `golf-league` (or anything you like)
1. Leave it **Public** or **Private** — both work fine
1. Click **“Create repository”**

### Step 2 — Upload the files

**Option A — GitHub web interface (no terminal needed):**

1. On your new repo page, click **“uploading an existing file”**
1. Drag and drop all the files, **preserving the folder structure**:
- Upload `api/matchups.js`
- Upload `public/favicon.svg`
- Upload `src/main.jsx` and `src/App.jsx`
- Upload `index.html`, `package.json`, `vite.config.js`, `vercel.json`, `.gitignore`
1. Click **“Commit changes”**

> ⚠️ GitHub’s drag-and-drop uploader keeps folder structure — just make sure `api/`, `src/`, and `public/` show up as folders in your repo.

**Option B — Git CLI:**

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/golf-league.git
git push -u origin main
```

-----

### Step 3 — Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
1. Click **“Add New Project”**
1. Find and select your `golf-league` repo → click **“Import”**
1. Vercel will auto-detect Vite — leave all settings as-is
1. Click **“Deploy”**

Your app will be live in ~60 seconds at a URL like:

```
https://golf-league-yourname.vercel.app
```

-----

### Step 4 — Add your Anthropic API key

The AI matchup feature needs your Anthropic API key stored securely in Vercel:

1. In your Vercel project, go to **Settings → Environment Variables**
1. Click **“Add New”**
1. Set:
- **Name:** `ANTHROPIC_API_KEY`
- **Value:** your key (starts with `sk-ant-...`)
- **Environment:** check all three (Production, Preview, Development)
1. Click **“Save”**
1. Go to **Deployments** → click the three dots on your latest deploy → **“Redeploy”**

> Get your API key at [console.anthropic.com](https://console.anthropic.com) → API Keys

-----

## 📱 Add to iPhone Home Screen

Once deployed, share the URL with your team. To install it like an app:

1. Open the URL in **Safari** on iPhone
1. Tap the **Share button** (box with arrow pointing up)
1. Scroll down and tap **“Add to Home Screen”**
1. Tap **“Add”**

It will appear as **“League Captain”** on your home screen and open full-screen like a native app.

-----

## 🔄 Making Updates

Any time you push changes to GitHub, Vercel automatically redeploys — no action needed.

-----

## ✨ Features

- 10-week regular season + 3-week playoffs (Quarterfinals, Semifinals, Championship)
- AI-suggested matchups using last season’s records, handicaps, and format history
- Captain approve/reject workflow
- Live standings with playoff seeding
- Formats: Individual, Best Ball, Alt Shot, Shamble
- Result recording with automatic W/L/T tracking
- Mobile-first, iPhone-optimized with safe area support
- “Add to Home Screen” PWA support
