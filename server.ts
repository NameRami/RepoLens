import express from "express";
import dotenv from "dotenv";
import path from "path";
import { getRepos } from "./src/github";
import { scoreRepo } from "./src/score";
import { generateStats } from "./src/stats";

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 3000);

app.use(express.static(path.join(__dirname, "public")));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/api/analyze/:username", async (req, res) => {
  try {
    const username = String(req.params.username || "").trim();

    if (!username) {
      res.status(400).json({ error: "GitHub username is required." });
      return;
    }

    const repos = await getRepos(username);

    const ranked = repos
      .map((repo: any) => ({
        id: repo.id,
        name: repo.name,
        description: repo.description,
        stars: repo.stargazers_count || 0,
        forks: repo.forks_count || 0,
        watchers: repo.watchers_count || 0,
        language: repo.language || "Unknown",
        updated: repo.updated_at,
        created: repo.created_at,
        size: repo.size || 0,
        url: repo.html_url,
        homepage: repo.homepage || "",
        topics: Array.isArray(repo.topics) ? repo.topics : [],
        archived: Boolean(repo.archived),
        fork: Boolean(repo.fork),
        license: repo.license?.spdx_id || null,
        score: scoreRepo(repo)
      }))
      .sort((a, b) => b.score - a.score);

    res.json({
      username,
      generatedAt: new Date().toISOString(),
      repos: ranked,
      stats: generateStats(ranked)
    });
  } catch (error: any) {
    const status = error?.response?.status || 500;
    const message =
      status === 404
        ? "GitHub user not found."
        : error?.response?.data?.message || error?.message || "Unexpected server error.";

    res.status(status).json({ error: message });
  }
});

app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(port, () => {
  console.log(`Repo Intel Dashboard running at http://localhost:${port}`);
});
