// frontend/src/components/review/review-input.tsx - Fixed API integration
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertCircle, CheckCircle2, Github } from 'lucide-react';
import { api } from '@/lib/api';
import type { PRInput, ReviewResult } from '@/lib/types';

interface ReviewInputProps {
  onReviewComplete: (data: ReviewResult) => void;
}

export function ReviewInput({ onReviewComplete }: ReviewInputProps) {
  const [prUrl, setPrUrl] = useState('');
  const [owner, setOwner] = useState('');
  const [repo, setRepo] = useState('');
  const [prNumber, setPrNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const parsePRUrl = (url: string) => {
    const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)\/pull\/(\d+)/);
    if (match) {
      setOwner(match[1]);
      setRepo(match[2]);
      setPrNumber(match[3]);
      setError('');
      return true;
    }
    return false;
  };

  const handleUrlChange = (url: string) => {
    setPrUrl(url);
    if (url) {
      const parsed = parsePRUrl(url);
      if (!parsed && url.includes('github.com')) {
        setError('Invalid GitHub PR URL format');
      } else if (parsed) {
        setError('');
      }
    }
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
      setError(err instanceof Error ? err.message : 'Failed to review PR. Please check your inputs and try again.');
    } finally {
      setLoading(false);
    }
  };

  const isValidInput = owner && repo && prNumber;

  return (
    <Card className="max-w-2xl mx-auto shadow-xl border-2">
      <CardHeader className="space-y-2 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-800">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-600 dark:bg-indigo-500">
            <Github className="h-6 w-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl">Review GitHub Pull Request</CardTitle>
            <CardDescription className="text-base">
              Enter a GitHub PR URL to get instant AI-powered feedback
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* PR URL Input */}
          <div className="space-y-2">
            <label className="text-sm font-semibold flex items-center gap-2">
              GitHub PR URL
              {isValidInput && (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              )}
            </label>
            <div className="relative">
              <Input
                type="text"
                placeholder="https://github.com/owner/repo/pull/123"
                value={prUrl}
                onChange={(e) => handleUrlChange(e.target.value)}
                className="h-12 text-base"
              />
              {prUrl && !isValidInput && (
                <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-amber-500" />
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Example: https://github.com/facebook/react/pull/12345
            </p>
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
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Owner
              </label>
              <Input
                type="text"
                placeholder="facebook"
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Repository
              </label>
              <Input
                type="text"
                placeholder="react"
                value={repo}
                onChange={(e) => setRepo(e.target.value)}
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                PR Number
              </label>
              <Input
                type="number"
                placeholder="123"
                value={prNumber}
                onChange={(e) => setPrNumber(e.target.value)}
                className="h-11"
              />
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-md">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800 dark:text-red-200">
                    Error
                  </p>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full h-12 text-base font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700" 
            disabled={loading || !isValidInput}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Analyzing PR with 5 AI Agents...
              </>
            ) : (
              <>
                <Github className="mr-2 h-5 w-5" />
                Review Pull Request
              </>
            )}
          </Button>

          {loading && (
            <div className="space-y-2 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 text-sm font-medium text-blue-900 dark:text-blue-100">
                <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                Running analysis...
              </div>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                This typically takes 10-30 seconds depending on PR size
              </p>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}