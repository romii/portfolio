'use server';

import { getLatestCommit, getCodeMetrics, GitHubCommit, CodeMetrics } from '@/lib/github';

function getGitHubUsername(): string | null {
  return process.env.GITHUB_USERNAME?.trim() || null;
}

function getEnvError(): string | null {
  if (!getGitHubUsername()) return 'GITHUB_USERNAME is not set (check Amplify env vars)';
  return null;
}

export async function fetchLatestCommit(): Promise<{ success: boolean; data?: GitHubCommit | null; error?: string }> {
  const envErr = getEnvError();
  if (envErr) {
    console.error('fetchLatestCommit:', envErr);
    return { success: false, error: envErr };
  }
  try {
    const commit = await getLatestCommit(getGitHubUsername()!);
    return { success: true, data: commit };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in fetchLatestCommit:', error);
    const safe = message.length < 80 && !/token|password|secret|key\s*=/i.test(message);
    return { success: false, error: safe ? message : 'Failed to fetch commit data' };
  }
}

export async function fetchCodeMetrics(): Promise<{ success: boolean; data?: CodeMetrics; error?: string }> {
  const envErr = getEnvError();
  if (envErr) {
    console.error('fetchCodeMetrics:', envErr);
    return { success: false, error: envErr };
  }
  try {
    const metrics = await getCodeMetrics(getGitHubUsername()!);
    if (metrics) {
      return { success: true, data: metrics };
    }
    return { success: false, error: 'No metrics data found' };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in fetchCodeMetrics:', error);
    const safe = message.length < 80 && !/token|password|secret|key\s*=/i.test(message);
    return { success: false, error: safe ? message : 'Failed to fetch metrics data' };
  }
} 