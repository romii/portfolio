'use client';

import { useEffect, useState } from 'react';
import { fetchCodeMetrics } from '@/app/actions';
import { CodeMetrics as CodeMetricsType } from '@/lib/github';

interface CodeMetricsProps {
  isMobile?: boolean;
}

export default function CodeMetrics({ isMobile = false }: CodeMetricsProps) {
  const [metrics, setMetrics] = useState<CodeMetricsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadMetrics() {
      try {
        setLoading(true);
        setError(null);
        
        const result = await fetchCodeMetrics();
        
        if (result.success && result.data) {
          setMetrics(result.data);
        } else {
          setError(result.error || 'Failed to load metrics data');
        }
      } catch (err) {
        setError('Failed to load metrics data');
        console.error('Error loading metrics:', err);
      } finally {
        setLoading(false);
      }
    }

    loadMetrics();
  }, []);

  const renderStats = () => {
    if (!metrics) return null;

    return (
      <div className="space-y-2 text-lg">
        <div className="flex">
          <span className="text-primary-500 text-glow">{metrics.totalRepos}</span>
          <span className="text-primary-400 text-glow ml-2"> REPOSITORIES</span>
        </div>
        <div className="flex">
          <span className="text-primary-500 text-glow">{metrics.languages.length}</span>
          <span className="text-primary-400 text-glow ml-2"> LANGUAGES</span>
        </div>
      </div>
    );
  };

  return (
    <div className={`space-y-3 ${isMobile ? 'lg:hidden' : 'hidden lg:block'}`}>
      <div className="border-t border-b border-primary-500 p-3 flex flex-col gap-3">
        <div className={`text-primary-500 text-glow ${isMobile ? 'text-lg' : 'text-2xl'}`}>
          METRICS
        </div>
        
        <div className="text-primary-400 text-sm space-y-3">
          {loading ? (
            <div className="text-glow">Loading metrics...</div>
          ) : error ? (
            <div className="text-red-400 text-glow">Error: {error}</div>
          ) : metrics ? (
            renderStats()
          ) : (
            <div className="text-glow">No metrics found</div>
          )}
        </div>
      </div>
    </div>
  );
} 