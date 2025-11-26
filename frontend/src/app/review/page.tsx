'use client';

import { useState } from 'react';
import { ReviewInput } from '@/components/review/review-input';
import { ResultsDisplay } from '@/components/results/results-display';
import type { ReviewResult } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function ReviewPage() {
  const [result, setResult] = useState<ReviewResult | null>(null);

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
            <h1 className="text-3xl font-bold mb-2">Review Pull Request</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Get instant AI-powered feedback on your GitHub PRs
            </p>
          </div>
          <ReviewInput onReviewComplete={handleReviewComplete} />
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
