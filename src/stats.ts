export function generateStats(repos: any[]) {
  const languages: Record<string, number> = {};
  const totalStars = repos.reduce((sum, repo) => sum + (repo.stars || 0), 0);
  const totalForks = repos.reduce((sum, repo) => sum + (repo.forks || 0), 0);

  for (const repo of repos) {
    const language = repo.language || "Unknown";
    languages[language] = (languages[language] || 0) + 1;
  }

  const languageRows = Object.entries(languages)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  const recentRepos = repos.filter((repo) => {
    const updated = new Date(repo.updated).getTime();
    const days = (Date.now() - updated) / (1000 * 60 * 60 * 24);
    return days <= 90;
  }).length;

  const averageScore =
    repos.length === 0
      ? 0
      : Math.round(repos.reduce((sum, repo) => sum + repo.score, 0) / repos.length);

  return {
    totalRepos: repos.length,
    totalStars,
    totalForks,
    recentRepos,
    averageScore,
    languages,
    languageRows,
    topByScore: repos.slice(0, 8),
    topByStars: [...repos].sort((a, b) => b.stars - a.stars).slice(0, 8)
  };
}
