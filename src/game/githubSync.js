
import { githubSeeds } from './content.js';
import { fetchServerRepositories } from './apiClient.js';

const PUBLIC_ENDPOINT = 'https://api.github.com/users/grumpystrongman/repos?sort=updated&per_page=30';

export async function syncGithubRepositories({ save } = {}) {
  try {
    const server = await fetchServerRepositories();
    if (Array.isArray(server.repositories) && server.repositories.length) {
      save?.saveRepositories(server.repositories);
      return { source: server.source || 'backend', repositories: server.repositories };
    }
  } catch {
    // Fall through to public GitHub endpoint for static deployments.
  }

  try {
    const response = await fetch(PUBLIC_ENDPOINT, { headers: { Accept: 'application/vnd.github+json' } });
    if (!response.ok) throw new Error(`GitHub responded ${response.status}`);
    const raw = await response.json();
    const mapped = raw.slice(0, 18).map(mapRepository).sort((a, b) => b.signal - a.signal);
    save?.saveRepositories(mapped);
    return { source: 'github-public', repositories: mapped };
  } catch (error) {
    const cached = save?.data?.repositoryCache;
    if (cached?.length) return { source: 'local-cache', repositories: cached, error };
    return { source: 'curated-seed', repositories: githubSeeds, error };
  }
}

function mapRepository(repo) {
  const name = repo.name || 'unknown';
  const text = `${name} ${repo.description || ''}`.toLowerCase();
  let realm = 'workshop';
  if (text.includes('threadline') || text.includes('ai') || text.includes('agent') || text.includes('llm')) realm = 'sanctum';
  else if (text.includes('analytics') || text.includes('fabric') || text.includes('databricks') || text.includes('dbt') || text.includes('platform')) realm = 'forge';
  else if (text.includes('health') || text.includes('payer') || text.includes('hipaa') || text.includes('clinical')) realm = 'archive';
  else if (text.includes('quantum') || text.includes('weather') || text.includes('simulation')) realm = 'observatory';
  const signal = Math.min(99, 45 + (repo.stargazers_count || 0) * 5 + (repo.forks_count || 0) * 3 + (repo.description ? 10 : 0));
  return {
    repo: name,
    title: repo.description || 'Living project artifact',
    realm,
    status: repo.archived ? 'archived' : 'active',
    signal,
    language: repo.language || 'unknown',
    url: repo.html_url,
    updatedAt: repo.updated_at,
    stars: repo.stargazers_count || 0,
    forks: repo.forks_count || 0
  };
}
