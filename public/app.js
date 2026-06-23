const state = {
  repos: [],
  stats: null,
  username: "",
  sort: "score",
  language: "all"
};

const els = {
  form: document.getElementById("searchForm"),
  input: document.getElementById("usernameInput"),
  status: document.getElementById("status"),
  totalRepos: document.getElementById("totalRepos"),
  totalStars: document.getElementById("totalStars"),
  totalForks: document.getElementById("totalForks"),
  recentRepos: document.getElementById("recentRepos"),
  signalScore: document.getElementById("signalScore"),
  signalText: document.getElementById("signalText"),
  languageCount: document.getElementById("languageCount"),
  languageChart: document.getElementById("languageChart"),
  scoreChart: document.getElementById("scoreChart"),
  repoGrid: document.getElementById("repoGrid"),
  languageFilter: document.getElementById("languageFilter"),
  sortSelect: document.getElementById("sortSelect")
};

function numberFormat(value) {
  return new Intl.NumberFormat("en", { notation: "compact" }).format(value || 0);
}

function formatDate(date) {
  if (!date) return "Unknown";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(date));
}

function showStatus(message, type = "info") {
  els.status.textContent = message;
  els.status.className = `status ${type === "error" ? "error" : ""}`;
}

function hideStatus() {
  els.status.className = "status hidden";
  els.status.textContent = "";
}

async function analyze(username) {
  const cleanUsername = username.trim();

  if (!cleanUsername) {
    showStatus("Enter a GitHub username first.", "error");
    return;
  }

  state.username = cleanUsername;
  showStatus(`Analyzing @${cleanUsername}...`);

  try {
    const response = await fetch(`/api/analyze/${encodeURIComponent(cleanUsername)}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Analysis failed.");
    }

    state.repos = data.repos;
    state.stats = data.stats;
    state.language = "all";
    state.sort = "score";

    els.sortSelect.value = "score";

    renderAll();
    hideStatus();
  } catch (error) {
    showStatus(error.message || "Could not load GitHub profile.", "error");
  }
}

function renderAll() {
  renderMetrics();
  renderLanguageFilter();
  renderLanguageChart();
  renderScoreChart();
  renderRepos();
}

function renderMetrics() {
  const stats = state.stats;

  els.totalRepos.textContent = numberFormat(stats.totalRepos);
  els.totalStars.textContent = numberFormat(stats.totalStars);
  els.totalForks.textContent = numberFormat(stats.totalForks);
  els.recentRepos.textContent = numberFormat(stats.recentRepos);

  const score = stats.averageScore || 0;
  els.signalScore.textContent = score;

  if (score >= 45) {
    els.signalText.textContent = "Strong portfolio signal. Several repos look presentation-ready.";
  } else if (score >= 25) {
    els.signalText.textContent = "Moderate signal. Good activity, but README polish and positioning may help.";
  } else {
    els.signalText.textContent = "Early-stage signal. Focus on one flagship repo and improve project presentation.";
  }
}

function renderLanguageFilter() {
  const languages = state.stats.languageRows.map((row) => row.name);

  els.languageFilter.innerHTML = [
    `<option value="all">All languages</option>`,
    ...languages.map((language) => `<option value="${escapeHtml(language)}">${escapeHtml(language)}</option>`)
  ].join("");

  els.languageFilter.value = state.language;
}

function renderLanguageChart() {
  const rows = state.stats.languageRows;
  const max = Math.max(...rows.map((row) => row.count), 1);

  els.languageCount.textContent = `${rows.length} languages`;

  if (rows.length === 0) {
    els.languageChart.innerHTML = `<div class="empty-state">No language data available.</div>`;
    return;
  }

  els.languageChart.innerHTML = rows
    .map((row) => {
      const width = Math.max(6, Math.round((row.count / max) * 100));
      return `
        <div class="bar-row">
          <div class="bar-label" title="${escapeHtml(row.name)}">${escapeHtml(row.name)}</div>
          <div class="track"><div class="fill" style="width:${width}%"></div></div>
          <div class="bar-value">${row.count}</div>
        </div>
      `;
    })
    .join("");
}

function renderScoreChart() {
  const rows = state.stats.topByScore.slice(0, 8);
  const max = Math.max(...rows.map((repo) => repo.score), 1);

  if (rows.length === 0) {
    els.scoreChart.innerHTML = `<div class="empty-state">No repositories found.</div>`;
    return;
  }

  els.scoreChart.innerHTML = rows
    .map((repo) => {
      const width = Math.max(6, Math.round((repo.score / max) * 100));
      return `
        <div class="score-row">
          <div class="score-label" title="${escapeHtml(repo.name)}">${escapeHtml(repo.name)}</div>
          <div class="track"><div class="fill" style="width:${width}%"></div></div>
          <div class="score-value">${repo.score}</div>
        </div>
      `;
    })
    .join("");
}

function getVisibleRepos() {
  let repos = [...state.repos];

  if (state.language !== "all") {
    repos = repos.filter((repo) => repo.language === state.language);
  }

  repos.sort((a, b) => {
    if (state.sort === "stars") return b.stars - a.stars;
    if (state.sort === "forks") return b.forks - a.forks;
    if (state.sort === "updated") return new Date(b.updated).getTime() - new Date(a.updated).getTime();
    if (state.sort === "name") return a.name.localeCompare(b.name);
    return b.score - a.score;
  });

  return repos;
}

function renderRepos() {
  const repos = getVisibleRepos();

  if (repos.length === 0) {
    els.repoGrid.innerHTML = `<div class="empty-state">No repositories match this filter.</div>`;
    return;
  }

  els.repoGrid.innerHTML = repos
    .map((repo) => {
      const description = repo.description || "No description yet. Add a strong README-style summary to improve portfolio clarity.";
      const topics = repo.topics && repo.topics.length
        ? repo.topics.slice(0, 3).map((topic) => `<span>#${escapeHtml(topic)}</span>`).join("")
        : "";

      return `
        <article class="repo-card">
          <div class="repo-top">
            <h4><a href="${repo.url}" target="_blank" rel="noreferrer">${escapeHtml(repo.name)}</a></h4>
            <div class="score-badge">${repo.score}</div>
          </div>

          <p class="repo-desc">${escapeHtml(description)}</p>

          <div class="repo-meta">
            <span>${escapeHtml(repo.language || "Unknown")}</span>
            <span>★ ${numberFormat(repo.stars)}</span>
            <span>⑂ ${numberFormat(repo.forks)}</span>
            ${repo.license ? `<span>${escapeHtml(repo.license)}</span>` : ""}
            ${repo.archived ? `<span>Archived</span>` : ""}
            ${topics}
          </div>

          <div class="repo-footer">
            <span>Updated ${formatDate(repo.updated)}</span>
            <span>${numberFormat(repo.size)} KB</span>
          </div>
        </article>
      `;
    })
    .join("");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

els.form.addEventListener("submit", (event) => {
  event.preventDefault();
  analyze(els.input.value);
});

els.languageFilter.addEventListener("change", () => {
  state.language = els.languageFilter.value;
  renderRepos();
});

els.sortSelect.addEventListener("change", () => {
  state.sort = els.sortSelect.value;
  renderRepos();
});

document.querySelectorAll("[data-user]").forEach((button) => {
  button.addEventListener("click", () => {
    const username = button.getAttribute("data-user");
    els.input.value = username;
    analyze(username);
  });
});

els.input.value = "namerami";
showStatus("Enter a username and run the analyzer.");
