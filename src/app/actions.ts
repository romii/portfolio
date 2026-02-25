'use server';

import { getLatestCommit, getCodeMetrics, GitHubCommit, CodeMetrics } from '@/lib/github';

function getGitHubUsername(): string {
  const username = process.env.GITHUB_USERNAME;
  if (!username) throw new Error('GITHUB_USERNAME is required');
  return username;
}

export async function fetchLatestCommit(): Promise<{ success: boolean; data?: GitHubCommit | null; error?: string }> {
  try {
    const commit = await getLatestCommit(getGitHubUsername());
    return { success: true, data: commit };
  } catch (error) {
    console.error('Error in fetchLatestCommit:', error);
    return { success: false, error: 'Failed to fetch commit data' };
  }
}

export async function fetchCodeMetrics(): Promise<{ success: boolean; data?: CodeMetrics; error?: string }> {
  try {
    const metrics = await getCodeMetrics(getGitHubUsername());
    if (metrics) {
      return { success: true, data: metrics };
    }
    return { success: false, error: 'No metrics data found' };
  } catch (error) {
    console.error('Error in fetchCodeMetrics:', error);
    return { success: false, error: 'Failed to fetch metrics data' };
  }
} 