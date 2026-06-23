import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const headers: Record<string, string> = {
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28"
};

if (process.env.GITHUB_TOKEN) {
  headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
}

const api = axios.create({
  baseURL: "https://api.github.com",
  headers,
  timeout: 15000
});

export async function getRepos(username: string) {
  const repos: any[] = [];
  let page = 1;

  while (true) {
    const response = await api.get(`/users/${username}/repos`, {
      params: {
        per_page: 100,
        page,
        sort: "updated",
        direction: "desc"
      }
    });

    if (!Array.isArray(response.data) || response.data.length === 0) {
      break;
    }

    repos.push(...response.data);
    page += 1;
  }

  return repos;
}
