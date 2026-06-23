function daysSince(dateString: string): number {
  const timestamp = new Date(dateString).getTime();

  if (Number.isNaN(timestamp)) {
    return 9999;
  }

  return (Date.now() - timestamp) / (1000 * 60 * 60 * 24);
}

export function scoreRepo(repo: any): number {
  let score = 0;

  const stars = repo.stargazers_count || 0;
  const forks = repo.forks_count || 0;
  const watchers = repo.watchers_count || 0;
  const size = repo.size || 0;
  const topics = Array.isArray(repo.topics) ? repo.topics : [];

  score += stars * 5;
  score += forks * 4;
  score += watchers * 1.5;

  const age = daysSince(repo.updated_at);

  if (age <= 14) score += 18;
  else if (age <= 30) score += 14;
  else if (age <= 90) score += 10;
  else if (age <= 180) score += 6;
  else if (age <= 365) score += 2;

  if (repo.description && repo.description.trim().length > 20) score += 8;
  else if (repo.description) score += 4;

  if (repo.homepage) score += 5;
  if (repo.license) score += 4;
  if (topics.length > 0) score += Math.min(8, topics.length * 2);

  if (size > 50 && size < 20000) score += 5;
  else if (size <= 50) score += 1;

  if (repo.archived) score -= 12;
  if (repo.fork) score -= 4;

  return Math.max(0, Math.round(score));
}
