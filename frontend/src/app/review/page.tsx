// frontend/src/app/review/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { ReviewInput } from '@/components/review/review-input';
import { DiffInput } from '@/components/review/diff-input';
import { ResultsDisplay } from '@/components/results/results-display';
import type { ReviewResult } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Github, FileText } from 'lucide-react';

type TabType = 'pr' | 'diff';

export default function ReviewPage() {
  const searchParams = useSearchParams();
  const [result, setResult] = useState<ReviewResult | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('pr');

  // Read tab from URL on mount
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'diff') {
      setActiveTab('diff');
    }
  }, [searchParams]);

  const handleReviewComplete = (data: ReviewResult) => {
    setResult(data);
  };

  const handleNewReview = () => {
    setResult(null);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {!result ? (
        <>
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Review Code</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Get instant AI-powered feedback on your code changes
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="mb-6 border-b-2 border-gray-200 dark:border-gray-700">
            <div className="flex gap-4">
              <button
                onClick={() => setActiveTab('pr')}
                className={`flex items-center gap-2 pb-3 px-4 border-b-2 font-semibold transition-colors ${
                  activeTab === 'pr'
                    ? 'border-teal-600 text-teal-600 dark:border-teal-400 dark:text-teal-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <Github className="h-5 w-5" />
                GitHub PR
              </button>
              <button
                onClick={() => setActiveTab('diff')}
                className={`flex items-center gap-2 pb-3 px-4 border-b-2 font-semibold transition-colors ${
                  activeTab === 'diff'
                    ? 'border-teal-600 text-teal-600 dark:border-teal-400 dark:text-teal-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <FileText className="h-5 w-5" />
                Git Diff
              </button>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'pr' ? (
            <ReviewInput onReviewComplete={handleReviewComplete} />
          ) : (
            <DiffInput onReviewComplete={handleReviewComplete} />
          )}
        </>
      ) : (
        <>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Review Results</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Found {result.summary.total_comments} potential issues
              </p>
            </div>
            <Button variant="outline" onClick={handleNewReview}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              New Review
            </Button>
          </div>
          <ResultsDisplay result={result} />
        </>
      )}
    </div>
  );
}