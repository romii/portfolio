export interface GitHubCommit {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      email: string;
      date: string;
    };
  };
  html_url: string;
  repository: {
    name: string;
    full_name: string;
    html_url: string;
  };
}

export interface LanguageStats {
  language: string;
  bytes: number;
  percentage: number;
}

export interface CodeMetrics {
  totalCommits: number;
  totalRepos: number;
  languages: LanguageStats[];
  commitsOverTime: { date: string; count: number }[];
}

export interface GitHubData {
  latestCommit: GitHubCommit | null;
  metrics: CodeMetrics;
}

// cache for all github data
const githubDataCache = new Map<string, { data: GitHubData; timestamp: number }>();
const GITHUB_CACHE_DURATION = 3 * 60 * 1000; // 3 minutes

// fetch github data
export async function getGitHubData(username: string): Promise<GitHubData | null> {
  // check cache first
  const cacheKey = `github_data_${username}`;
  const cached = githubDataCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < GITHUB_CACHE_DURATION) {
    console.log('Using cached GitHub data');
    return cached.data;
  }

  try {
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'romii0x-portfolio'
    };

    // github token
    const githubToken = process.env.GITHUB_TOKEN;
    if (githubToken) {
      headers['Authorization'] = `token ${githubToken}`;
    }

    // get repositories
    const reposResponse = await fetch(
      `https://api.github.com/users/${username}/repos?sort=updated&per_page=100`,
      {
        headers,
        next: { revalidate: 300 }
      }
    );

    if (!reposResponse.ok) {
      if (reposResponse.status === 403) {
        console.error('GitHub API rate limit exceeded');
        return null;
      }
      console.error('Failed to fetch GitHub repositories:', reposResponse.status);
      return null;
    }

    const repos = await reposResponse.json();

    // Latest commit from Events API (includes all branches); repo commits only show default branch
    let latestCommit: GitHubCommit | null = null;
    try {
      const eventsResponse = await fetch(
        `https://api.github.com/users/${username}/events?per_page=30`,
        { headers, next: { revalidate: 300 } }
      );
      if (eventsResponse.ok) {
        const events = await eventsResponse.json();
        const pushEvent = events.find((e: { type: string }) => e.type === 'PushEvent');
        if (pushEvent?.payload?.commits?.length > 0) {
          const repoName = pushEvent.repo?.name ?? ''; // "owner/repo"
          const c = pushEvent.payload.commits[0];
          const sha = typeof c.sha === 'string' ? c.sha : '';
          const shortSha = sha.length >= 7 ? sha.substring(0, 7) : sha;
          latestCommit = {
            sha: shortSha,
            commit: {
              message: (c.message || '').split('\n')[0],
              author: {
                name: c.author?.name ?? 'Unknown',
                email: c.author?.email ?? '',
                date: pushEvent.created_at ?? new Date().toISOString(),
              },
            },
            html_url: `https://github.com/${repoName}/commit/${sha}`,
            repository: {
              name: repoName.split('/').pop() ?? repoName,
              full_name: repoName,
              html_url: `https://github.com/${repoName}`,
            },
          };
        }
      }
    } catch {
      // fall back to repo-commits below
    }
    
    const languageMap = new Map<string, number>();
    let totalCommits = 0;
    const commitsOverTime: { date: string; count: number }[] = [];
    let latestDate = new Date(0);
    
    // initialize last 30 days
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      // local date format
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      commitsOverTime.push({
        date: `${year}-${month}-${day}`,
        count: 0
      });
    }

    // collect all commits from all repositories
    type RawCommit = {
      sha: string;
      commit: { message: string; author: { name: string; email: string; date: string } };
      html_url: string;
    };
    type Repo = { name: string; full_name: string; html_url: string };
    const allCommits: Array<{ commit: RawCommit; repo: Repo }> = [];

    // look through repositories
    for (const repo of repos) {
      try {
        // get language stats
        const languagesResponse = await fetch(
          `https://api.github.com/repos/${repo.full_name}/languages`,
          {
            headers,
            next: { revalidate: 300 }
          }
        );

        if (languagesResponse.ok) {
          const languages = await languagesResponse.json();
          
          for (const [language, bytes] of Object.entries(languages)) {
            const currentBytes = languageMap.get(language) || 0;
            languageMap.set(language, currentBytes + (bytes as number));
          }
        }

        // get commits for total count, timeline, and latest commit
        const commitsResponse = await fetch(
          `https://api.github.com/repos/${repo.full_name}/commits?per_page=100`,
          {
            headers,
            next: { revalidate: 300 }
          }
        );

        if (commitsResponse.ok) {
          const commits = await commitsResponse.json();
          totalCommits += commits.length;
          
          // collect all commits for later processing
          for (const commit of commits) {
            allCommits.push({ commit, repo });
          }
        }
      } catch (error) {
        console.error(`Error processing ${repo.full_name}:`, error);
        continue;
      }
    }

    // process all commits for activity timeline; use Events-based latestCommit if we have it, else fall back to latest from repo commits
    if (!latestCommit) {
      for (const { commit, repo } of allCommits) {
        const commitDate = new Date(commit.commit.author.date);  
        if (commitDate > latestDate) {
          latestDate = commitDate;
          latestCommit = {
            sha: commit.sha.substring(0, 7),
            commit: {
              message: commit.commit.message.split('\n')[0],
              author: commit.commit.author
            },
            html_url: commit.html_url,
            repository: {
              name: repo.name,
              full_name: repo.full_name,
              html_url: repo.html_url
            }
          };
        }
      }
    }
    for (const { commit } of allCommits) {
      const commitDate = new Date(commit.commit.author.date);
      // use local date format to match contribution graph
      const year = commitDate.getFullYear();
      const month = String(commitDate.getMonth() + 1).padStart(2, '0');
      const day = String(commitDate.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;
      
      const timeIndex = commitsOverTime.findIndex(d => d.date === dateString);
      if (timeIndex !== -1) {
        commitsOverTime[timeIndex].count++;
      }
    }

    // calculate language percentages
    const totalBytes = Array.from(languageMap.values()).reduce((sum, bytes) => sum + bytes, 0);
    const languages: LanguageStats[] = Array.from(languageMap.entries())
      .map(([language, bytes]) => ({
        language,
        bytes,
        percentage: totalBytes > 0 ? (bytes / totalBytes) * 100 : 0
      }))
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 8);

    const metrics: CodeMetrics = {
      totalCommits,
      totalRepos: repos.length,
      languages,
      commitsOverTime
    };

    const result: GitHubData = {
      latestCommit,
      metrics
    };

    // cache result
    githubDataCache.set(cacheKey, { data: result, timestamp: Date.now() });
    console.log(`Cached GitHub data for ${username} (${repos.length} repos, ${totalCommits} commits)`);

    return result;
  } catch (error) {
    console.error('Error fetching GitHub data:', error);
    return null;
  }
}

export async function getLatestCommit(username: string): Promise<GitHubCommit | null> {
  const data = await getGitHubData(username);
  return data?.latestCommit || null;
}

export async function getCodeMetrics(username: string): Promise<CodeMetrics | null> {
  const data = await getGitHubData(username);
  return data?.metrics || null;
}
