# Repo Intel Dashboard Pro

A polished local GitHub repository intelligence dashboard built with **TypeScript**, **Express**, and a custom frontend UI.

It analyzes a GitHub user's public repositories, ranks them, and displays portfolio-style insights with charts, cards, filters, and direct repo links.

---

## Preview Features

- Local dashboard at `http://localhost:3000`
- GitHub repository ranking table
- Score-based project cards
- Language distribution chart
- Top-score chart
- Search by GitHub username
- Filter by language
- Sort by score, stars, forks, or recent update
- Clean responsive UI
- No native modules
- No `canvas`
- No Visual Studio build tools required
- Works on Windows + Node 24

---

## Requirements

Install Node.js first:

```bash
node -v
npm -v
```

Recommended Node version: Node 20 or newer.

---

## Installation

```bash
npm install
```

---

## GitHub Token Setup

A token is recommended because unauthenticated GitHub API requests have lower rate limits.

Create a token here:

https://github.com/settings/tokens

Suggested token type:

1. Go to **GitHub Settings**
2. Open **Developer settings**
3. Open **Personal access tokens**
4. Choose **Tokens classic** or a fine-grained token
5. Generate a token
6. Copy it immediately

For public repository analysis, you usually do not need broad permissions. Public read access is enough.

Create a `.env` file in the project root:

```env
GITHUB_TOKEN=your_token_here
PORT=3000
```

Do not commit `.env` to GitHub. It is already ignored by `.gitignore`.

---

## Run Locally

```bash
npm run dev
```

Then open:

```text
http://localhost:3000
```

Enter a GitHub username and click **Analyze profile**.

Example usernames:

```text
namerami
torvalds
vercel
```

---

## Build and Run Production Version

```bash
npm run build
npm start
```

Then open:

```text
http://localhost:3000
```

---

## Project Structure

```text
repo-intel-dashboard-pro/
├── public/
│   ├── app.js
│   ├── index.html
│   └── styles.css
├── src/
│   ├── github.ts
│   ├── score.ts
│   └── stats.ts
├── .env.example
├── .gitignore
├── package.json
├── server.ts
└── tsconfig.json
```

---

## API Endpoint

```text
GET /api/analyze/:username
```

Example:

```text
http://localhost:3000/api/analyze/torvalds
```

Response includes:

- ranked repositories
- language distribution
- total stars
- total forks
- recently updated count
- top repository by score

---

## Scoring Logic

Repos are scored using:

- stars
- forks
- watchers
- recent activity
- description presence
- homepage presence
- topics
- license
- repo size sanity
- non-archived status

The scoring logic lives in:

```text
src/score.ts
```

You can tune the weights there.

---

## Upload to GitHub

```bash
git init
git add .
git commit -m "Initial commit: repo intelligence dashboard"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```

Recommended GitHub topics:

```text
typescript
express
github-api
dashboard
developer-tools
portfolio
```

---

## Notes

This project intentionally avoids native charting dependencies. Charts are rendered with custom HTML/CSS/SVG-style bars in the browser, so it stays stable on Windows, macOS, and Linux.
