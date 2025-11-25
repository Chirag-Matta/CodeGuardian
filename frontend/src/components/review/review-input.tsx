'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import type { PRInput } from '@/lib/types';

interface ReviewInputProps {
  onReviewComplete: (data: any) => void;
}

export function ReviewInput({ onReviewComplete }: ReviewInputProps) {
  const [prUrl, setPrUrl] = useState('');
  const [owner, setOwner] = useState('');
  const [repo, setRepo] = useState('');
  const [prNumber, setPrNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [agents, setAgents] = useState({
    security: true,
    performance: true,
    logic: true,
    quality: true,
    readability: true,
  });

  const parsePRUrl = (url: string) => {
    // Parse GitHub PR URL: https://github.com/owner/repo/pull/123
    const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)\/pull\/(\d+)/);
    if (match) {
      setOwner(match[1]);
      setRepo(match[2]);
      setPrNumber(match[3]);
      return true;
    }
    return false;
  };

  const handleUrlChange = (url: string) => {
    setPrUrl(url);
    parsePRUrl(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!owner || !repo || !prNumber) {
      setError('Please provide a valid GitHub PR URL or fill in all fields manually');
      return;
    }

    setLoading(true);

    try {
      const data: PRInput = {
        owner,
        repo,
        pr_number: parseInt(prNumber),
      };

      const result = await api.reviewPR(data);
      onReviewComplete(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to review PR');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Review GitHub Pull Request</CardTitle>
        <CardDescription>
          Enter a GitHub PR URL or fill in the details manually
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* PR URL Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">GitHub PR URL</label>
            <Input
              type="text"
              placeholder="https://github.com/owner/repo/pull/123"
              value={prUrl}
              onChange={(e) => handleUrlChange(e.target.value)}
            />
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200 dark:border-gray-700" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-gray-800 px-2 text-gray-500">
                Or enter manually
              </span>
            </div>
          </div>

          {/* Manual Input */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Owner</label>
              <Input
                type="text"
                placeholder="owner"
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Repo</label>
              <Input
                type="text"
                placeholder="repo"
                value={repo}
                onChange={(e) => setRepo(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">PR #</label>
              <Input
                type="number"
                placeholder="123"
                value={prNumber}
                onChange={(e) => setPrNumber(e.target.value)}
              />
            </div>
          </div>

          {/* Agent Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Agents to Run</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Object.entries(agents).map(([key, value]) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => setAgents({ ...agents, [key]: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                  <span className="text-sm capitalize">{key}</span>
                </label>
              ))}
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Reviewing PR...
              </>
            ) : (
              'Review Pull Request'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
